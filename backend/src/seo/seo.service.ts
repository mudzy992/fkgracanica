import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  private baseUrl() {
    return process.env.API_PUBLIC_URL?.replace(/\/api\/v1\/?$/, '') ?? 'https://fkgracanica.ba';
  }

  async buildSitemap() {
    const base = this.baseUrl();
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
    const base = this.baseUrl();
    return `User-agent: *\nAllow: /\nSitemap: ${base}/api/v1/sitemap.xml\n`;
  }
}
