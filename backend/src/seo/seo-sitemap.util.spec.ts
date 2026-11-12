import { buildSitemapEntries, renderSitemap } from './seo-sitemap.util';

const BASE = 'https://fkgracanica.ba';
const at = (iso: string) => new Date(iso);

const SOURCES = {
  staticPaths: ['/', '/o-klubu'],
  news: [{ slug: 'pobjeda', updatedAt: at('2026-10-01T10:00:00.000Z') }],
  galleries: [{ slug: 'kup', updatedAt: at('2026-10-02T10:00:00.000Z') }],
  players: [{ id: 'p1', updatedAt: at('2026-10-03T10:00:00.000Z') }],
  timeline: [{ id: 't1', updatedAt: at('2026-10-04T10:00:00.000Z') }],
  hallOfFame: [{ id: 'h1', updatedAt: at('2026-10-05T10:00:00.000Z') }],
  museum: [{ id: 'm1', updatedAt: at('2026-10-06T10:00:00.000Z') }],
  now: '2026-11-03T00:00:00.000Z',
};

describe('seo-sitemap.util (BE-08 / P-B08-5)', () => {
  it('gradi po jedan zapis po tipu sadržaja', () => {
    const entries = buildSitemapEntries(BASE, SOURCES);
    expect(entries).toHaveLength(8);
    expect(entries.map((e) => e.loc)).toEqual([
      `${BASE}/`,
      `${BASE}/o-klubu`,
      `${BASE}/vijesti/pobjeda`,
      `${BASE}/galerija/kup`,
      `${BASE}/igrac/p1`,
      `${BASE}/o-klubu#t1`,
      `${BASE}/o-klubu/kuca-slavnih#h1`,
      `${BASE}/muzej#m1`,
    ]);
  });

  it('static rute su monthly, vijesti i galerije weekly', () => {
    const entries = buildSitemapEntries(BASE, SOURCES);
    expect(entries[0].changefreq).toBe('monthly');
    expect(entries[2].changefreq).toBe('weekly');
    expect(entries[3].changefreq).toBe('weekly');
    expect(entries[4].changefreq).toBe('monthly');
  });

  it('lastmod je ISO string iz updatedAt, static rute koriste now', () => {
    const entries = buildSitemapEntries(BASE, SOURCES);
    expect(entries[0].lastmod).toBe('2026-11-03T00:00:00.000Z');
    expect(entries[2].lastmod).toBe('2026-10-01T10:00:00.000Z');
  });

  it('renderSitemap escapea lokacije (slug sa & ili <)', () => {
    const xml = renderSitemap([
      {
        loc: `${BASE}/vijesti/a&b<c`,
        lastmod: '2026-11-03T00:00:00.000Z',
        changefreq: 'weekly',
      },
    ]);
    expect(xml).toContain(
      '<loc>https://fkgracanica.ba/vijesti/a&amp;b&lt;c</loc>',
    );
    expect(xml).not.toContain('a&b');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<changefreq>weekly</changefreq>');
    expect(xml.trim().endsWith('</urlset>')).toBe(true);
  });

  it('renderSitemap sa praznom listom daje validan prazan urlset', () => {
    const xml = renderSitemap([]);
    expect(xml).toContain('<urlset');
    expect(xml).not.toContain('<url>');
  });
});
