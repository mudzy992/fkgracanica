import { describe, expect, it } from 'vitest';
import { asArray, asNumber, asRecord, asString } from './content-helpers';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { htmlToParagraphs, stripHtml } from './html-text';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { slugify } from './slugify';
import { brand, darkColors } from './theme';

describe('mob-batch159 — P-MOB72 html/search/helpers/slugify/date/theme (test-only)', () => {
  it('asRecord asString asNumber asArray', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asString('hi')).toBe('hi');
    expect(asString(123, 'fb')).toBe('fb');
    expect(asNumber(5)).toBe(5);
    expect(asNumber('x', 7)).toBe(7);
    expect(asArray([1])).toEqual([1]);
    expect(asArray(null)).toEqual([]);
  });
  it('stripHtml br p entities', () => {
    expect(stripHtml('a<br>b')).toBe('a\nb');
    expect(stripHtml('<p>Hi</p>there')).toContain('Hi');
    expect(stripHtml('A &amp; B')).toBe('A & B');
    expect(stripHtml('&lt;x&gt;')).toBe('<x>');
    expect(stripHtml('&#65; &#x41;')).toBe('A A');
  });
  it('stripHtml empty', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml('<b>bold</b>')).toBe('bold');
    expect(stripHtml('a &unknown; b')).toBe('a  b');
  });
  it('htmlToParagraphs', () => {
    expect(htmlToParagraphs('<p>Prvi</p><p>Drugi</p>')).toEqual(['Prvi', 'Drugi']);
    expect(htmlToParagraphs('')).toEqual([]);
    expect(htmlToParagraphs('a<br><br>b')).toEqual(['a', 'b']);
  });
  it('flattenSearchResponse', () => {
    const out = flattenSearchResponse({ news: [{ id: 'n1', title: 'V', slug: 's' }], players: [{ id: 'p1', firstName: 'Edin', lastName: 'Dzeko' }] });
    expect(out.find((x) => x.type === 'news')?.title).toBe('V');
    expect(out.find((x) => x.type === 'players')?.title).toBe('Edin Dzeko');
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse({})).toEqual([]);
  });
  it('flattenSearchResponse clubs matches', () => {
    const out = flattenSearchResponse({ clubs: [{ id: 'c1', name: 'FKG' }], matches: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } }] });
    expect(out.find((x) => x.type === 'clubs')?.title).toBe('FKG');
    expect(out.find((x) => x.type === 'matches')?.title).toBe('A vs B');
  });
  it('groupSearchItems', () => {
    const items = [{ id: '1', type: 'clubs', title: 'C' }, { id: '2', type: 'news', title: 'N' }] as any;
    expect(groupSearchItems(items).map((g) => g.type)).toEqual(['news', 'clubs']);
    expect(groupSearchItems([])).toEqual([]);
  });
  it('searchItemHref news players', () => {
    expect(searchItemHref({ id: '1', type: 'news', title: 'a', slug: 'moja' } as any)).toBe('/news/moja');
    expect(searchItemHref({ id: '1', type: 'news', title: 'a' } as any)).toBeNull();
    expect(searchItemHref({ id: 'p1', type: 'players', title: 'a' } as any)).toBe('/player/p1');
    expect(searchItemHref({ id: 'm1', type: 'matches', title: 'a' } as any)).toBe('/live/m1');
  });
  it('searchItemHref other', () => {
    expect(searchItemHref({ id: 'g1', type: 'galleries', title: 'a', slug: 'gal' } as any)).toBe('/gallery/gal');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a', slug: 'club' } as any)).toBe('/clubs/club');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a' } as any)).toBe('/team');
    expect(searchItemHref({ id: 't1', type: 'trophies', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 'x', type: 'unknown', title: 'a' } as any)).toBeNull();
  });
  it('slugify', () => {
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
    expect(slugify('Čović žuti')).toBe('covic-zuti');
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('  --- test---  ')).toBe('test');
    expect(slugify('')).toBe('');
  });
  it('slugify dash numbers', () => {
    expect(slugify('a--b')).toBe('a-b');
    expect(slugify('123 test')).toBe('123-test');
  });
  it('formatDateBs', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    expect(formatDateBs('2024-03-05T12:00:00Z')).toMatch(/05\.03\.2024\./);
  });
  it('formatDateTimeBs', () => {
    expect(formatDateTimeBs(null)).toBe('—');
    expect(formatDateTimeBs('2024-01-02T15:04:05Z')).toContain('02.01.2024.');
    expect(formatDateTimeBs('2024-01-02T15:04:05Z')).toMatch(/\d{2}:\d{2}/);
  });
  it('theme brand', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.white).toBe('#FFFFFF');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.link).toBe(brand.primaryLight);
  });
  it('heritage fallback', () => {
    expect(searchItemHref({ id: 't1', type: 'timeline', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 'h1', type: 'hallOfFame', title: 'a' } as any)).toBe('/heritage');
    expect(flattenSearchResponse({})).toEqual([]);
  });
});
