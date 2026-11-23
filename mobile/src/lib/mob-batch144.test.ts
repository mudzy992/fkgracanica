import { describe, expect, it } from 'vitest';
import { asArray, asNumber, asRecord, asString } from './content-helpers';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { htmlToParagraphs, stripHtml } from './html-text';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { slugify } from './slugify';
import { brand, darkColors, spacing } from './theme';

describe('mob-batch144 — P-MOB57 html/search/slugify/date/helpers/theme (test-only)', () => {
  it('stripHtml br p entities', () => {
    expect(stripHtml('a<br>b')).toBe('a\nb');
    expect(stripHtml('<p>Hi</p>there')).toContain('Hi');
    expect(stripHtml('A &amp; B &lt;3')).toBe('A & B <3');
    expect(stripHtml('&#65; &#x41;')).toBe('A A');
  });
  it('stripHtml empty and nbsp', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml('a &nbsp; b')).toBe('a   b');
    expect(stripHtml('<b>bold</b>')).toBe('bold');
  });
  it('htmlToParagraphs splits', () => {
    expect(htmlToParagraphs('<p>Prvi</p><p>Drugi</p>')).toEqual(['Prvi', 'Drugi']);
    expect(htmlToParagraphs('')).toEqual([]);
    expect(htmlToParagraphs('a<br><br>b')).toEqual(['a', 'b']);
  });
  it('flattenSearchResponse shapes', () => {
    const out = flattenSearchResponse({ news: [{ id: 'n1', title: 'Vijest', slug: 'vijest' }], players: [{ id: 'p1', firstName: 'Edin', lastName: 'Džeko' }] });
    expect(out.find((x) => x.type === 'news')?.title).toBe('Vijest');
    expect(out.find((x) => x.type === 'players')?.title).toBe('Edin Džeko');
    expect(out.find((x) => x.type === 'news')?.slug).toBe('vijest');
  });
  it('flattenSearchResponse fallbacks', () => {
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse({ clubs: [{ id: 'c1', name: 'FKG' }], matches: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } }] }).find((x) => x.type === 'clubs')?.title).toBe('FKG');
    expect(flattenSearchResponse({ galleries: [{ id: 99, title: 'Gal' }] as any })[0].id).toBe('99');
  });
  it('groupSearchItems order', () => {
    const items = [{ id: '1', type: 'clubs', title: 'C' }, { id: '2', type: 'news', title: 'N' }] as any;
    expect(groupSearchItems(items).map((g) => g.type)).toEqual(['news', 'clubs']);
    expect(groupSearchItems([])).toEqual([]);
  });
  it('searchItemHref routes', () => {
    expect(searchItemHref({ id: '1', type: 'news', title: 'a', slug: 'slug' } as any)).toBe('/news/slug');
    expect(searchItemHref({ id: '1', type: 'news', title: 'a' } as any)).toBeNull();
    expect(searchItemHref({ id: 'p1', type: 'players', title: 'a' } as any)).toBe('/player/p1');
    expect(searchItemHref({ id: 'm1', type: 'matches', title: 'a' } as any)).toBe('/live/m1');
    expect(searchItemHref({ id: 'x', type: 'unknown', title: 'a' } as any)).toBeNull();
  });
  it('searchItemHref galleries clubs trophies', () => {
    expect(searchItemHref({ id: 'g1', type: 'galleries', title: 'a', slug: 'gal' } as any)).toBe('/gallery/gal');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a', slug: 'club' } as any)).toBe('/clubs/club');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a' } as any)).toBe('/team');
    expect(searchItemHref({ id: 't1', type: 'trophies', title: 'a' } as any)).toBe('/heritage');
  });
  it('slugify basic and diacritics', () => {
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
    expect(slugify('Čović žuti')).toBe('covic-zuti');
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('  --- test---  ')).toBe('test');
  });
  it('slugify empty and numbers', () => {
    expect(slugify('')).toBe('');
    expect(slugify('123 test')).toBe('123-test');
    expect(slugify('a--b')).toBe('a-b');
  });
  it('formatDateBs null and known', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    expect(formatDateBs('2024-03-05T12:00:00Z')).toMatch(/05\.03\.2024\./);
  });
  it('formatDateTimeBs', () => {
    expect(formatDateTimeBs(null)).toBe('—');
    expect(formatDateTimeBs('2024-01-02T15:04:05Z')).toContain('02.01.2024.');
    expect(formatDateTimeBs('2024-01-02T15:04:05Z')).toMatch(/\d{2}:\d{2}/);
  });
  it('asRecord asString asNumber asArray', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asString('hi')).toBe('hi');
    expect(asString(123, 'fb')).toBe('fb');
    expect(asNumber(5)).toBe(5);
    expect(asNumber('5', 7)).toBe(7);
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray(null)).toEqual([]);
  });
  it('theme brand and spacing', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(darkColors.background).toBe('#050A14');
    expect(spacing.md).toBe(16);
    expect(darkColors.link).toBe(brand.primaryLight);
  });
  it('theme trophies fallback', () => {
    expect(flattenSearchResponse({})).toEqual([]);
    expect(searchItemHref({ id: 't1', type: 'timeline', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 'h1', type: 'hallOfFame', title: 'a' } as any)).toBe('/heritage');
  });
});
