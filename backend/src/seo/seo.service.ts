import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  matchShareDescription,
  matchShareImage,
  matchShareTitle,
} from './match-share.util';
import type { ShareMeta } from './share-meta.types';
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
  constructor(private readonly prisma: PrismaService) {}

  private siteBaseUrl() {
    return sitePublicUrl();
  }

  async buildSitemap() {
    const base = this.siteBaseUrl();
    const [news, galleries] = await Promise.all([
      this.prisma.news.findMany({
        where: { status: ContentStatus.PUBLISHED },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.gallery.findMany({
        where: { status: ContentStatus.PUBLISHED },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const staticUrls = ['', '/o-klubu', '/vijesti', '/galerija', '/tim', '/liga', '/kontakt'];
    const urls = [
      ...staticUrls.map((p) => ({ loc: `${base}${p}`, lastmod: new Date().toISOString() })),
      ...news.map((n) => ({ loc: `${base}/vijesti/${n.slug}`, lastmod: n.updatedAt.toISOString() })),
      ...galleries.map((g) => ({ loc: `${base}/galerija/${g.slug}`, lastmod: g.updatedAt.toISOString() })),
    ];

    const body = urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>weekly</changefreq></url>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
  }

  buildRobots() {
    const base = this.siteBaseUrl();
    const api = (process.env.API_PUBLIC_URL ?? base).replace(/\/$/, '');
    return `User-agent: *\nAllow: /\nSitemap: ${api}/api/v1/sitemap.xml\n`;
  }

  async resolveShareMeta(path: string): Promise<ShareMeta> {
    const defaults = await this.loadSiteDefaults();
    const normalized = path.split('?')[0] || '/';

    if (normalized === '/' || normalized === '') {
      return this.pack({
        title: defaults.siteName,
        description: defaults.description,
        image: defaults.crestUrl,
        url: '/',
        defaults,
      });
    }
    if (normalized === '/vijesti') {
      return this.pack({
        title: 'Vijesti',
        description: 'Najnovije vijesti, izvještaji sa utakmica i objave FK Gračanica.',
        url: '/vijesti',
        defaults,
      });
    }
    const news = normalized.match(/^\/vijesti\/([^/]+)$/);
    if (news) return this.fromNews(news[1], defaults);

    const match = normalized.match(/^\/utakmice\/([^/]+)$/);
    if (match) return this.fromMatch(match[1], false, defaults);

    const live = normalized.match(/^\/live\/([^/]+)$/);
    if (live) return this.fromMatch(live[1], true, defaults);

    const cms = normalized.match(/^\/p\/([^/]+)$/);
    if (cms) return this.fromCmsPage(cms[1], normalized, defaults);

    return this.pack({
      title: defaults.siteName,
      description: defaults.description,
      image: defaults.crestUrl,
      url: normalized,
      defaults,
    });
  }

  private async loadSiteDefaults() {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: { in: ['club.name', 'seo.title', 'seo.description', 'club.crestUrl'] },
      },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const siteName = map['club.name']?.trim() || map['seo.title']?.trim() || 'FK Gračanica';
    const description =
      map['seo.description']?.trim() ||
      'Službena web stranica FK Gračanica — vijesti, utakmice, članstvo i ulaznice.';
    const crestPath = map['club.crestUrl'] ?? null;
    const crestUrl = mediaPublicUrl(crestPath, 'medium');
    return { siteName, description, crestPath, crestUrl };
  }

  private pack(input: {
    title: string;
    description: string;
    image?: string;
    url: string;
    type?: 'website' | 'article';
    defaults: { siteName: string; description: string; crestPath?: string | null; crestUrl?: string };
  }): ShareMeta {
    const title = input.title.trim() || input.defaults.siteName;
    const description = truncateMeta(stripHtml(input.description) || input.defaults.description);
    const image = input.image || input.defaults.crestUrl;
    const siteName = input.defaults.siteName;
    return {
      title,
      description,
      image,
      url: absolutePageUrl(input.url),
      type: input.type ?? 'website',
      siteName,
      documentTitle: buildDocumentTitle(title, siteName),
    };
  }

  private async fromCmsPage(slug: string, url: string, defaults: Awaited<ReturnType<typeof this.loadSiteDefaults>>) {
    const page = await this.prisma.cmsPage.findUnique({ where: { slug } });
    return this.pack({
      title: page?.seoTitle ?? page?.title ?? defaults.siteName,
      description: page?.seoDesc ?? defaults.description,
      url,
      defaults,
    });
  }

  private async fromNews(slug: string, defaults: Awaited<ReturnType<typeof this.loadSiteDefaults>>) {
    const item = await this.prisma.news.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!item) {
      return this.pack({ title: 'Vijest', description: defaults.description, url: `/vijesti/${slug}`, defaults });
    }
    return this.pack({
      title: item.seoTitle ?? item.title,
      description: item.seoDesc ?? item.excerpt ?? defaults.description,
      image: mediaPublicUrl(item.coverPath, 'medium'),
      url: `/vijesti/${slug}`,
      type: 'article',
      defaults,
    });
  }

  private async fromMatch(id: string, live: boolean, defaults: Awaited<ReturnType<typeof this.loadSiteDefaults>>) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { homeClub: true, awayClub: true, season: { include: { competition: true } } },
    });
    if (!match) {
      return this.pack({ title: 'Utakmica', description: defaults.description, url: live ? `/live/${id}` : `/utakmice/${id}`, defaults });
    }
    const scheduled = live && match.status === 'SCHEDULED';
    const title = scheduled
      ? `${matchShareTitle(match.homeClub, match.awayClub, match.status, match.homeScore, match.awayScore)} — Uskoro`
      : matchShareTitle(match.homeClub, match.awayClub, match.status, match.homeScore, match.awayScore, live);
    const crest = matchShareImage(match.homeClub, match.awayClub, defaults.crestPath);
    return this.pack({
      title,
      description: matchShareDescription({
        home: match.homeClub,
        away: match.awayClub,
        scheduledAt: match.scheduledAt,
        venue: match.venue,
        competition: match.season?.competition?.name,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        live: live || match.status === 'LIVE' || match.status === 'HALFTIME',
      }),
      image: mediaPublicUrl(crest, 'medium') ?? defaults.crestUrl,
      url: live ? `/live/${id}` : `/utakmice/${id}`,
      type: 'article',
      defaults,
    });
  }
}
