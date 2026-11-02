import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ShareMeta } from './share-meta.types';
import type { PackInput, SiteDefaults } from './share-defaults';
import { SITEMAP_STATIC_PATHS, STATIC_SHARE_PAGES } from './share-pages';
import { ShareResolvers } from './share-resolvers';
import {
  absolutePageUrl,
  buildDocumentTitle,
  mediaPublicUrl,
  sitePublicUrl,
  stripHtml,
  truncateMeta,
} from './seo-url.util';

@Injectable()
export class SeoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolvers: ShareResolvers,
  ) {}

  async buildSitemap() {
    const base = sitePublicUrl();
    const [news, galleries, players, timeline, hallOfFame, museum] =
      await Promise.all([
        this.prisma.news.findMany({
          where: { status: ContentStatus.PUBLISHED },
          select: { slug: true, updatedAt: true },
        }),
        this.prisma.gallery.findMany({
          where: { status: ContentStatus.PUBLISHED },
          select: { slug: true, updatedAt: true },
        }),
        this.prisma.player.findMany({
          where: { isActive: true },
          select: { id: true, updatedAt: true },
        }),
        this.prisma.clubTimelineEvent.findMany({
          select: { id: true, updatedAt: true },
        }),
        this.prisma.hallOfFameEntry.findMany({
          select: { id: true, updatedAt: true },
        }),
        this.prisma.museumItem.findMany({
          select: { id: true, updatedAt: true },
        }),
      ]);
    const now = new Date().toISOString();
    const urls = [
      ...SITEMAP_STATIC_PATHS.map((p) => ({
        loc: `${base}${p}`,
        lastmod: now,
      })),
      ...news.map((n) => ({
        loc: `${base}/vijesti/${n.slug}`,
        lastmod: n.updatedAt.toISOString(),
      })),
      ...galleries.map((g) => ({
        loc: `${base}/galerija/${g.slug}`,
        lastmod: g.updatedAt.toISOString(),
      })),
      ...players.map((p) => ({
        loc: `${base}/igrac/${p.id}`,
        lastmod: p.updatedAt.toISOString(),
      })),
      ...timeline.map((e) => ({
        loc: `${base}/o-klubu#${e.id}`,
        lastmod: e.updatedAt.toISOString(),
      })),
      ...hallOfFame.map((e) => ({
        loc: `${base}/o-klubu/kuca-slavnih#${e.id}`,
        lastmod: e.updatedAt.toISOString(),
      })),
      ...museum.map((i) => ({
        loc: `${base}/muzej#${i.id}`,
        lastmod: i.updatedAt.toISOString(),
      })),
    ];
    const body = urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>weekly</changefreq></url>`,
      )
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
  }

  async buildRobots() {
    const api = (process.env.API_PUBLIC_URL ?? sitePublicUrl()).replace(
      /\/$/,
      '',
    );
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'seo.robotsIndex' },
    });
    const robotsIndex = setting?.value !== 'false';
    if (!robotsIndex) return 'User-agent: *\nDisallow: /\n';
    return `User-agent: *\nAllow: /\nSitemap: ${api}/api/v1/sitemap.xml\n`;
  }

  async resolveShareMeta(path: string): Promise<ShareMeta> {
    const defaults = await this.loadSiteDefaults();
    const normalized = path.split('?')[0] || '/';

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
      crestUrl: mediaPublicUrl(crestPath, 'medium'),
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
      url: absolutePageUrl(input.url),
      type: input.type ?? 'website',
      siteName,
      documentTitle: buildDocumentTitle(title, siteName),
    };
  }
}
