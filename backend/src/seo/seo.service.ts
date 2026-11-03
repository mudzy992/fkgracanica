import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type { ShareMeta } from './share-meta.types';
import type { PackInput, SiteDefaults } from './share-defaults';
import { SITEMAP_STATIC_PATHS, STATIC_SHARE_PAGES } from './share-pages';
import { ShareResolvers } from './share-resolvers';
import { buildSitemapEntries, renderSitemap } from './seo-sitemap.util';
import { loadSitemapData } from './seo-sitemap-sources';
import {
  absolutePageUrl,
  apiPublicBase,
  buildDocumentTitle,
  mediaPublicUrl,
  normalizeSharePath,
  sitePublicUrl,
  stripHtml,
  truncateMeta,
} from './seo-url.util';

@Injectable()
export class SeoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolvers: ShareResolvers,
    private readonly config: ConfigService,
  ) {}

  /** BE-08/P-B08-1: jedini izvor API URL-a (bez `process.env`). */
  private apiBase(): string | undefined {
    return this.config.get<string>('apiPublicUrl');
  }

  async buildSitemap() {
    const base = sitePublicUrl(this.apiBase());
    const data = await loadSitemapData(this.prisma);
    // P-B08-5: gradnja + XML escape izdvojeni u `seo-sitemap.util.ts`.
    return renderSitemap(
      buildSitemapEntries(base, {
        ...data,
        staticPaths: SITEMAP_STATIC_PATHS,
        now: new Date().toISOString(),
      }),
    );
  }

  async buildRobots() {
    const api = apiPublicBase(this.apiBase());
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'seo.robotsIndex' },
    });
    const robotsIndex = setting?.value !== 'false';
    if (!robotsIndex) return 'User-agent: *\nDisallow: /\n';
    return `User-agent: *\nAllow: /\nSitemap: ${api}/api/v1/sitemap.xml\n`;
  }

  async resolveShareMeta(path: string): Promise<ShareMeta> {
    const defaults = await this.loadSiteDefaults();
    // P-B08-4: samo site-relativna putanja; apsolutni URL → '/'.
    const normalized = normalizeSharePath(path);

    if (normalized === '/' || normalized === '') {
      return this.pack(
        {
          title: defaults.siteName,
          description: defaults.description,
          image: defaults.crestUrl,
          url: '/',
        },
        defaults,
      );
    }

    if (normalized === '/o-klubu') {
      return this.pack(await this.resolvers.fromClubAbout(defaults), defaults);
    }

    const staticPage = STATIC_SHARE_PAGES[normalized];
    if (staticPage)
      return this.pack({ ...staticPage, url: normalized }, defaults);

    const news = normalized.match(/^\/vijesti\/([^/]+)$/);
    if (news)
      return this.pack(
        await this.resolvers.fromNews(news[1], defaults),
        defaults,
      );

    const match = normalized.match(/^\/utakmice\/([^/]+)$/);
    if (match)
      return this.pack(
        await this.resolvers.fromMatch(match[1], false, defaults),
        defaults,
      );

    const live = normalized.match(/^\/live\/([^/]+)$/);
    if (live)
      return this.pack(
        await this.resolvers.fromMatch(live[1], true, defaults),
        defaults,
      );

    const cms = normalized.match(/^\/p\/([^/]+)$/);
    if (cms)
      return this.pack(
        await this.resolvers.fromCmsPage(cms[1], normalized, defaults),
        defaults,
      );

    const gallery = normalized.match(/^\/galerija\/([^/]+)$/);
    if (gallery)
      return this.pack(
        await this.resolvers.fromGallery(gallery[1], defaults),
        defaults,
      );

    const player = normalized.match(/^\/igrac\/([^/]+)$/);
    if (player)
      return this.pack(
        await this.resolvers.fromPlayer(player[1], defaults),
        defaults,
      );

    return this.pack(
      {
        title: defaults.siteName,
        description: defaults.description,
        image: defaults.crestUrl,
        url: normalized,
      },
      defaults,
    );
  }

  private async loadSiteDefaults(): Promise<SiteDefaults> {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          in: [
            'club.name',
            'seo.title',
            'seo.description',
            'club.crestUrl',
            'seo.twitterHandle',
          ],
        },
      },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const siteName =
      map['club.name']?.trim() || map['seo.title']?.trim() || 'FK Gračanica';
    const description =
      map['seo.description']?.trim() ||
      'Službena web stranica FK Gračanica — vijesti, utakmice, članstvo i ulaznice.';
    const crestPath = map['club.crestUrl'] ?? null;
    return {
      siteName,
      description,
      crestPath,
      crestUrl: mediaPublicUrl(crestPath, 'medium', this.apiBase()),
    };
  }

  private pack(input: PackInput, defaults: SiteDefaults): ShareMeta {
    const title = input.title.trim() || defaults.siteName;
    const description = truncateMeta(
      stripHtml(input.description) || defaults.description,
    );
    const siteName = defaults.siteName;
    return {
      title,
      description,
      image: input.image || defaults.crestUrl,
      url: absolutePageUrl(input.url, this.apiBase()),
      type: input.type ?? 'website',
      siteName,
      documentTitle: buildDocumentTitle(title, siteName),
    };
  }
}
