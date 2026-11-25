import { describe, expect, it } from 'vitest';
import { flattenSeasonEditions } from './flatten-editions';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { htmlToParagraphs, stripHtml } from './html-text';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { slugify } from './slugify';

describe('mob-batch206 — P-MOB119 html/search/format/slugify (test-only)', () => {
  it('stripHtml empty tags', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml('<p>Hello<br>World</p>')).toContain('Hello');
    expect(stripHtml('<p>Hello<br>World</p>')).toContain('World');
  });
  it('stripHtml entities', () => {
    expect(stripHtml('A &amp; B')).toBe('A & B');
    expect(stripHtml('&#65;')).toBe('A');
    expect(stripHtml('&#x41;')).toBe('A');
    expect(stripHtml('&lt;x&gt;')).toBe('<x>');
  });
  it('stripHtml nbsp and break', () => {
    expect(stripHtml('a&nbsp;b')).toBe('a b');
    expect(stripHtml('a<br/>b')).toContain('a');
    expect(stripHtml('a<br/>b')).toContain('b');
  });
  it('htmlToParagraphs', () => {
    expect(htmlToParagraphs('<p>Prvi</p><p>Drugi</p>')).toEqual(['Prvi', 'Drugi']);
    expect(htmlToParagraphs('')).toEqual([]);
    expect(htmlToParagraphs('<p>  </p>')).toEqual([]);
  });
  it('formatDateBs null pattern', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    const iso = '2024-02-20T00:00:00.000Z';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    expect(formatDateBs(iso)).toBe(`${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}.`);
  });
  it('formatDateTimeBs', () => {
    expect(formatDateTimeBs('')).toBe('—');
    expect(formatDateTimeBs('2024-06-15T10:30:00.000Z')).toContain(':');
    expect(formatDateTimeBs(null)).toBe('—');
  });
  it('slugify', () => {
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
    expect(slugify('Čović & Žabić')).toBe('covic-zabic');
    expect(slugify('  --Hello  World--  ')).toBe('hello-world');
    expect(slugify('')).toBe('');
  });
  it('flattenSeasonEditions', () => {
    const data = [{ id: 'c1', name: '2023', competitions: [{ id: 'e1', competition: { name: 'Liga' } }] }];
    expect(flattenSeasonEditions(data)[0].id).toBe('e1');
    expect(flattenSeasonEditions(null)).toEqual([]);
    expect(flattenSeasonEditions([])).toEqual([]);
  });
  it('flattenSeasonEditions fallback', () => {
    expect(flattenSeasonEditions([{ id: 'c', competitions: [{ id: 'e', competition: {} }] }])[0].name).toBe('Takmičenje · Sezona');
    expect(flattenSeasonEditions([{ id: 'c', competitions: [{ id: '', competition: { name: 'X' } }] }])).toEqual([]);
  });
  it('flattenSearchResponse news players', () => {
    const data = { news: [{ id: 'n1', title: 'Vijest', slug: 'vijest' }], players: [{ id: 'p1', firstName: 'Edin', lastName: 'Dzeko' }] };
    const out = flattenSearchResponse(data);
    expect(out.find((x) => x.type === 'news')?.title).toBe('Vijest');
    expect(out.find((x) => x.type === 'players')?.title).toBe('Edin Dzeko');
  });
  it('flattenSearchResponse matches', () => {
    const data = { matches: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } }], clubs: [{ id: 'c1', name: 'FK' }] };
    expect(flattenSearchResponse(data).find((x) => x.id === 'm1')?.title).toBe('A vs B');
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse({ news: [{ id: '' }] })).toEqual([]);
  });
  it('groupSearchItems', () => {
    const items = [{ id: 'n1', title: 'N', type: 'news' }, { id: 'p1', title: 'P', type: 'players' }, { id: 'n2', title: 'N2', type: 'news' }];
    const groups = groupSearchItems(items as any);
    expect(groups.find((g) => g.type === 'news')?.data.length).toBe(2);
    expect(groups.find((g) => g.type === 'players')?.data.length).toBe(1);
  });
  it('searchItemHref news gallery', () => {
    expect(searchItemHref({ id: 'n1', title: 'T', type: 'news', slug: 'slug1' })).toBe('/news/slug1');
    expect(searchItemHref({ id: 'n1', title: 'T', type: 'news' })).toBeNull();
    expect(searchItemHref({ id: 'g1', title: 'G', type: 'galleries', slug: 'gal' })).toBe('/gallery/gal');
  });
  it('searchItemHref players matches clubs', () => {
    expect(searchItemHref({ id: 'p1', title: 'P', type: 'players' })).toBe('/player/p1');
    expect(searchItemHref({ id: 'm1', title: 'M', type: 'matches' })).toBe('/live/m1');
    expect(searchItemHref({ id: 'c1', title: 'C', type: 'clubs', slug: 'fk' })).toBe('/clubs/fk');
    expect(searchItemHref({ id: 'c2', title: 'C', type: 'clubs' })).toBe('/team');
  });
  it('searchItemHref heritage', () => {
    expect(searchItemHref({ id: 't1', title: 'T', type: 'trophies' })).toBe('/heritage');
    expect(searchItemHref({ id: 'h1', title: 'H', type: 'hallOfFame' })).toBe('/heritage');
    expect(searchItemHref({ id: 'x', title: 'X', type: 'unknown' })).toBeNull();
  });
});
