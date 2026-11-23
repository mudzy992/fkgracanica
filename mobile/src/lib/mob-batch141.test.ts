import { describe, expect, it } from 'vitest';
import { htmlToParagraphs, stripHtml } from './html-text';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { brand, colors, darkColors, spacing, typography } from './theme';

describe('mob-batch141 — P-MOB54 html/search/theme (test-only)', () => {
  it('stripHtml empty plain', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml('plain')).toBe('plain');
  });
  it('stripHtml br p newline', () => {
    expect(stripHtml('a<br>b')).toBe('a\nb');
    expect(stripHtml('<p>Hello</p>World')).toContain('Hello');
    expect(stripHtml('<p>a</p><p>b</p>')).toBe('a\nb');
  });
  it('stripHtml entities', () => {
    expect(stripHtml('A &amp; B')).toBe('A & B');
    expect(stripHtml('&lt;x&gt;')).toBe('<x>');
    expect(stripHtml('&#65;')).toBe('A');
    expect(stripHtml('&#x41;')).toBe('A');
  });
  it('stripHtml unknown and tags', () => {
    expect(stripHtml('a &unknown; b')).toBe('a  b');
    expect(stripHtml('<b>bold</b>')).toBe('bold');
  });
  it('htmlToParagraphs splits', () => {
    expect(htmlToParagraphs('<p>Prvi</p><p>Drugi</p>')).toEqual(['Prvi', 'Drugi']);
    expect(htmlToParagraphs('')).toEqual([]);
    expect(htmlToParagraphs('a<br><br>b')).toEqual(['a', 'b']);
  });
  it('flattenSearchResponse invalid', () => {
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse({})).toEqual([]);
    expect(flattenSearchResponse('x')).toEqual([]);
  });
  it('flattenSearchResponse news players', () => {
    const out = flattenSearchResponse({ news: [{ id: 'n1', title: 'Vijest', slug: 's' }], players: [{ id: 'p1', firstName: 'Edin', lastName: 'Dzeko' }] });
    expect(out.find((x) => x.type === 'news')?.title).toBe('Vijest');
    expect(out.find((x) => x.type === 'players')?.title).toBe('Edin Dzeko');
  });
  it('flattenSearchResponse title fallback', () => {
    const out = flattenSearchResponse({ clubs: [{ id: 'c1', name: 'FKG' }], matches: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } }] });
    expect(out.find((x) => x.type === 'clubs')?.title).toBe('FKG');
    expect(out.find((x) => x.type === 'matches')?.title).toBe('A vs B');
  });
  it('flattenSearchResponse numeric id', () => {
    const out = flattenSearchResponse({ news: [{ id: 123, title: 'Num' }] as any });
    expect(out[0].id).toBe('123');
  });
  it('groupSearchItems order', () => {
    const items = [{ id: '1', type: 'clubs', title: 'C' }, { id: '2', type: 'news', title: 'N' }] as any;
    expect(groupSearchItems(items).map((g) => g.type)).toEqual(['news', 'clubs']);
    expect(groupSearchItems([])).toEqual([]);
  });
  it('searchItemHref news players galleries matches', () => {
    expect(searchItemHref({ id: '1', type: 'news', title: 'a', slug: 'moja' } as any)).toBe('/news/moja');
    expect(searchItemHref({ id: '1', type: 'news', title: 'a' } as any)).toBeNull();
    expect(searchItemHref({ id: 'p1', type: 'players', title: 'a' } as any)).toBe('/player/p1');
    expect(searchItemHref({ id: 'm1', type: 'matches', title: 'a' } as any)).toBe('/live/m1');
  });
  it('searchItemHref clubs heritage unknown', () => {
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a', slug: 'club' } as any)).toBe('/clubs/club');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a' } as any)).toBe('/team');
    expect(searchItemHref({ id: 't1', type: 'trophies', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 'x', type: 'unknown', title: 'a' } as any)).toBeNull();
  });
  it('theme brand darkColors', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.white).toBe('#FFFFFF');
    expect(darkColors.background).toBe('#050A14');
    expect(colors).toBe(darkColors);
  });
  it('spacing typography', () => {
    expect(spacing.md).toBe(16);
    expect(typography.display.fontSize).toBe(34);
    expect(typography.caption.fontSize).toBe(13);
  });
  it('theme link', () => {
    expect(darkColors.link).toBe('#93C5FD');
    expect(darkColors.link).toBe(brand.primaryLight);
  });
});
