import { beforeEach, describe, expect, it } from 'vitest';
import { applySeoToDocument } from '../components/seo/seo-document';
import { absoluteUrl, buildDocumentTitle, defaultShareImage, resolveSeoMeta, siteOrigin, stripHtml, truncateMeta } from './seo-meta';

const metaContent = (attr: 'name' | 'property', key: string) =>
  document.querySelector(`meta[${attr}="${key}"][data-seo="1"]`)?.getAttribute('content');

const clearSeo = () => {
  document.querySelectorAll('[data-seo="1"]').forEach((el) => el.remove());
  document.title = '';
};

beforeEach(clearSeo);

describe('seo-meta pomoćnici', () => {
  it('siteOrigin i absoluteUrl grade apsolutne putanje', () => {
    expect(siteOrigin()).toBe(window.location.origin);
    expect(absoluteUrl()).toBe(`${window.location.origin}/`);
    expect(absoluteUrl('/vijesti/a')).toBe(`${window.location.origin}/vijesti/a`);
    expect(absoluteUrl('vijesti')).toBe(`${window.location.origin}/vijesti`);
    expect(absoluteUrl('https://drugi.example/x')).toBe('https://drugi.example/x');
  });

  it('buildDocumentTitle ne duplira naziv sajta', () => {
    expect(buildDocumentTitle(undefined, 'FK')).toBe('FK');
    expect(buildDocumentTitle('   ', 'FK')).toBe('FK');
    expect(buildDocumentTitle('FK', 'FK')).toBe('FK');
    expect(buildDocumentTitle(' Vijest ', 'FK')).toBe('Vijest | FK');
  });

  it('defaultShareImage koristi mediaUrl za grb i bez njega vraća undefined', () => {
    expect(defaultShareImage('uploads/crest.png')).toContain('crest');
    expect(defaultShareImage(null)).toBeUndefined();
  });

  it('stripHtml i truncateMeta čiste tekst', () => {
    expect(stripHtml('<p>Zdravo <b>svijete</b></p>')).toBe('Zdravo svijete');
    expect(stripHtml(null)).toBe('');
    expect(truncateMeta('kratko')).toBe('kratko');
    expect(truncateMeta('x'.repeat(200))).toHaveLength(160);
  });

  it('resolveSeoMeta popunjava zamjenske vrijednosti i article tip', () => {
    const meta = resolveSeoMeta({
      siteName: '  ', defaultDescription: '<p>Opis</p>', type: 'article', url: '/x', image: 'https://img/x.png',
    });
    expect(meta.siteName).toBe('FK Gračanica');
    expect(meta.title).toBe('FK Gračanica');
    expect(meta.description).toBe('Opis');
    expect(meta.type).toBe('article');
    expect(meta.url).toBe(`${window.location.origin}/x`);
  });

  it('resolveSeoMeta koristi rezervnu sliku kada nema eksplicitne', () => {
    const meta = resolveSeoMeta({
      siteName: 'FK', defaultDescription: 'Opis', defaultImage: 'https://img/rezerva.png',
    });
    expect(meta.image).toBe('https://img/rezerva.png');
    expect(meta.type).toBe('website');
  });
});

describe('applySeoToDocument', () => {
  it('postavlja naslov, canonical, OG/Twitter i robots meta', () => {
    applySeoToDocument({
      title: 'Vijest', description: '<b>Opis</b>', url: '/vijesti/1',
      image: 'https://img/x.png', siteName: 'FK Test', twitterHandle: '@fk', type: 'article',
    });
    expect(document.title).toBe('Vijest | FK Test');
    expect(document.querySelector('link[rel="canonical"][data-seo="1"]')?.getAttribute('href'))
      .toBe(`${window.location.origin}/vijesti/1`);
    expect(metaContent('name', 'description')).toBe('Opis');
    expect(metaContent('property', 'og:title')).toBe('Vijest');
    expect(metaContent('property', 'og:type')).toBe('article');
    expect(metaContent('property', 'og:locale')).toBe('bs_BA');
    expect(metaContent('name', 'twitter:card')).toBe('summary_large_image');
    expect(metaContent('name', 'twitter:site')).toBe('@fk');
    expect(metaContent('property', 'og:image')).toBe('https://img/x.png');
    expect(metaContent('name', 'twitter:image')).toBe('https://img/x.png');
    expect(metaContent('name', 'robots')).toBe('index, follow');
  });

  it('ponovni poziv ažurira postojeće oznake umjesto dupliranja', () => {
    applySeoToDocument({ title: 'Prva', url: '/a' });
    const firstCount = document.querySelectorAll('meta[data-seo="1"]').length;
    applySeoToDocument({ title: 'Druga', url: '/b', robotsIndex: false });
    expect(document.querySelectorAll('meta[data-seo="1"]')).toHaveLength(firstCount);
    expect(document.querySelectorAll('link[rel="canonical"][data-seo="1"]')).toHaveLength(1);
    expect(metaContent('property', 'og:title')).toBe('Druga');
    expect(metaContent('name', 'robots')).toBe('noindex, nofollow');
  });

  it('upisuje JSON-LD blokove i zamjenjuje prethodne', () => {
    applySeoToDocument({ title: 'A', jsonLd: { '@type': 'Organization' } });
    let scripts = document.querySelectorAll('script[type="application/ld+json"][data-seo="1"]');
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0].textContent ?? '{}')).toEqual({ '@type': 'Organization' });
    applySeoToDocument({ title: 'B', jsonLd: [{ '@type': 'A' }, { '@type': 'B' }] });
    scripts = document.querySelectorAll('script[type="application/ld+json"][data-seo="1"]');
    expect(scripts).toHaveLength(2);
    expect(scripts[1].getAttribute('data-seo-id')).toBe('1');
  });

  it('bez slike i JSON-LD ne dodaje oznake slike ni skripte', () => {
    applySeoToDocument({ title: 'Bez slike' });
    expect(document.querySelector('meta[property="og:image"]')).toBeNull();
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
    expect(metaContent('name', 'twitter:site')).toBeUndefined();
  });
});
