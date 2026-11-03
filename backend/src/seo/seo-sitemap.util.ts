import { escapeXml } from './seo-url.util';

export type SitemapChangefreq =
  'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: SitemapChangefreq;
}

/** Minimalni oblik reda iz baze (slug/id + updatedAt). */
export interface SitemapRow {
  slug?: string;
  id?: string;
  updatedAt: Date;
}

export interface SitemapSources {
  staticPaths: readonly string[];
  news: SitemapRow[];
  galleries: SitemapRow[];
  players: SitemapRow[];
  timeline: SitemapRow[];
  hallOfFame: SitemapRow[];
  museum: SitemapRow[];
  now: string;
}

/**
 * BE-08 / P-B08-5: sitemap se gradi iz čistih funkcija (bez Prisma-e) da bi
 * se XML escape i `changefreq` po tipu sadržaja mogli testirati direktno.
 */
export function buildSitemapEntries(
  base: string,
  src: SitemapSources,
): SitemapEntry[] {
  const stamp = (row: SitemapRow) => row.updatedAt.toISOString();
  return [
    ...src.staticPaths.map((p) => ({
      loc: `${base}${p}`,
      lastmod: src.now,
      changefreq: 'monthly' as const,
    })),
    ...src.news.map((n) => ({
      loc: `${base}/vijesti/${n.slug}`,
      lastmod: stamp(n),
      changefreq: 'weekly' as const,
    })),
    ...src.galleries.map((g) => ({
      loc: `${base}/galerija/${g.slug}`,
      lastmod: stamp(g),
      changefreq: 'weekly' as const,
    })),
    ...src.players.map((p) => ({
      loc: `${base}/igrac/${p.id}`,
      lastmod: stamp(p),
      changefreq: 'monthly' as const,
    })),
    ...src.timeline.map((e) => ({
      loc: `${base}/o-klubu#${e.id}`,
      lastmod: stamp(e),
      changefreq: 'monthly' as const,
    })),
    ...src.hallOfFame.map((e) => ({
      loc: `${base}/o-klubu/kuca-slavnih#${e.id}`,
      lastmod: stamp(e),
      changefreq: 'monthly' as const,
    })),
    ...src.museum.map((i) => ({
      loc: `${base}/muzej#${i.id}`,
      lastmod: stamp(i),
      changefreq: 'monthly' as const,
    })),
  ];
}

/** Serializuje sitemap; `loc` se XML-escapea (slug/id sa `&`/`<`). */
export function renderSitemap(entries: SitemapEntry[]): string {
  const body = entries
    .map(
      (u) =>
        `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${escapeXml(u.lastmod)}</lastmod><changefreq>${u.changefreq}</changefreq></url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}
