import { describe, expect, it, vi } from 'vitest';
import { buildArticleLd, buildSportsOrganizationLd } from './seo-json-ld';

/**
 * Batch 34 — JSON-LD bez grba, bez `siteUrl`, bez slike i bez datuma
 * (opciona polja se izostavljaju iz izlaza).
 */
vi.mock('../../lib/seo-meta', () => ({
  absoluteUrl: (path: string) => `https://fkgracanica.ba${path.startsWith('/') ? path : `/${path}`}`,
}));

describe('buildSportsOrganizationLd', () => {
  it('bez grba i bez `siteUrl` koristi korijen sajta i nema logotipa', () => {
    const ld = buildSportsOrganizationLd({ name: 'FK Gračanica' });
    expect(ld).toEqual({
      '@context': 'https://schema.org',
      '@type': 'SportsOrganization',
      name: 'FK Gračanica',
      url: 'https://fkgracanica.ba/',
    });
    expect(ld).not.toHaveProperty('logo');
  });

  it('sa grbom i `siteUrl` uključuje oba polja', () => {
    const ld = buildSportsOrganizationLd({
      name: 'FK Gračanica',
      crestUrl: 'https://cdn/grb.png',
      siteUrl: '/o-klubu',
    });
    expect(ld).toMatchObject({ logo: 'https://cdn/grb.png', url: 'https://fkgracanica.ba/o-klubu' });
  });
});

describe('buildArticleLd', () => {
  it('bez slike i datuma izostavlja oba polja', () => {
    const ld = buildArticleLd({
      headline: 'Naslov',
      description: 'Opis',
      path: '/vijesti/naslov',
      datePublished: null,
    });
    expect(ld).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Naslov',
      description: 'Opis',
      url: 'https://fkgracanica.ba/vijesti/naslov',
    });
  });

  it('sa slikom i datumom uključuje oba polja', () => {
    const ld = buildArticleLd({
      headline: 'Naslov',
      description: 'Opis',
      path: '/vijesti/naslov',
      image: 'https://cdn/slika.jpg',
      datePublished: '2026-05-01T10:00:00Z',
    });
    expect(ld).toMatchObject({
      image: 'https://cdn/slika.jpg',
      datePublished: '2026-05-01T10:00:00Z',
    });
  });
});
