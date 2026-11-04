import { describe, expect, it } from 'vitest';
import { absoluteUrl, buildDocumentTitle, defaultShareImage, resolveSeoMeta, stripHtml, truncateMeta } from './seo-meta';

describe('SEO metapodaci', () => {
  it('normalizuje relativne canonical URL-ove, a apsolutne čuva', () => {
    expect(absoluteUrl()).toBe(`${window.location.origin}/`);
    expect(absoluteUrl('vijesti/proba')).toBe(`${window.location.origin}/vijesti/proba`);
    expect(absoluteUrl('/kontakt')).toBe(`${window.location.origin}/kontakt`);
    expect(absoluteUrl('https://example.test/vijest')).toBe('https://example.test/vijest');
  });

  it('sastavlja naslov bez ponavljanja i priprema kratak tekst', () => {
    expect(buildDocumentTitle(undefined, 'Klub')).toBe('Klub');
    expect(buildDocumentTitle('  Klub ', 'Klub')).toBe('Klub');
    expect(buildDocumentTitle(' Vijesti ', 'Klub')).toBe('Vijesti | Klub');
    expect(stripHtml('<p>Prvi</p>  <b>drugi</b>')).toBe('Prvi drugi');
    expect(stripHtml(null)).toBe('');
    expect(truncateMeta('kratko', 8)).toBe('kratko');
    expect(truncateMeta('abcdef', 4)).toBe('abc…');
  });

  it('koristi zadane vrijednosti i alternativnu sliku bez izmišljanja slike', () => {
    expect(resolveSeoMeta({ siteName: ' ', defaultDescription: '<b>Tekst</b>' })).toEqual({
      siteName: 'FK Gračanica', title: 'FK Gračanica', description: 'Tekst', image: undefined,
      url: `${window.location.origin}/`, type: 'website',
    });
    expect(resolveSeoMeta({ siteName: 'Klub', title: ' Vijest ', description: ' <p>Opis</p> ', image: '/photo', url: '/vijesti', type: 'article', defaultDescription: 'fallback' })).toMatchObject({
      siteName: 'Klub', title: 'Vijest', description: 'Opis', image: '/photo', url: `${window.location.origin}/vijesti`, type: 'article',
    });
    expect(defaultShareImage()).toBeUndefined();
    expect(defaultShareImage('originals/crest.png')).toContain('/uploads/files/medium/crest.webp');
  });
});
