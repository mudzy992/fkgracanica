import { describe, expect, it } from 'vitest';
import { htmlToParagraphs, stripHtml } from './html-text';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { brand, colors, darkColors, spacing, typography } from './theme';

describe('mob-batch136 — P-MOB49 html/search/theme (test-only)', () => {
  it('stripHtml empty and plain', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml('hello world')).toBe('hello world');
  });
  it('stripHtml br and p newlines', () => {
    expect(stripHtml('a<br>b')).toBe('a\nb');
    expect(stripHtml('a<br/>b')).toBe('a\nb');
    expect(stripHtml('<p>Hello</p>World')).toContain('Hello');
    expect(stripHtml('<p>a</p><p>b</p>')).toBe('a\nb');
  });
  it('stripHtml entities amp lt gt quot apos nbsp', () => {
    expect(stripHtml('A &amp; B')).toBe('A & B');
    expect(stripHtml('&lt;x&gt;')).toBe('<x>');
    expect(stripHtml('&quot;hi&quot;')).toBe('"hi"');
    expect(stripHtml("a&apos;b")).toBe("a'b");
    expect(stripHtml('a&nbsp;b')).toBe('a b');
  });
  it('stripHtml numeric dec and hex', () => {
    expect(stripHtml('&#65;')).toBe('A');
    expect(stripHtml('&#x41;')).toBe('A');
    expect(stripHtml('&#x61;')).toBe('a');
  });
  it('stripHtml unknown entity and tag removal', () => {
    expect(stripHtml('a &unknown; b')).toBe('a  b');
    expect(stripHtml('<b>bold</b> text')).toBe('bold text');
    expect(stripHtml('<p>a</p><p></p><p></p><p>b</p>')).not.toContain('\n\n\n');
  });
  it('htmlToParagraphs splits and filters', () => {
    expect(htmlToParagraphs('<p>Prvi</p><p>Drugi</p>')).toEqual(['Prvi', 'Drugi']);
    expect(htmlToParagraphs('a<br><br>b')).toEqual(['a', 'b']);
    expect(htmlToParagraphs('')).toEqual([]);
    expect(htmlToParagraphs('<p>  spaced  </p>')).toEqual(['spaced']);
  });
  it('flattenSearchResponse invalid input', () => {
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse(undefined)).toEqual([]);
    expect(flattenSearchResponse('x')).toEqual([]);
    expect(flattenSearchResponse({})).toEqual([]);
  });
  it('flattenSearchResponse maps news and players fallback', () => {
    const data = { news: [{ id: 'n1', title: 'Vijest', slug: 'vijest' }], players: [{ id: 'p1', firstName: 'Edin', lastName: 'Dzeko' }] };
    const out = flattenSearchResponse(data);
    expect(out.find((x) => x.type === 'news')).toEqual(expect.objectContaining({ id: 'n1', title: 'Vijest' }));
    expect(out.find((x) => x.type === 'players')?.title).toBe('Edin Dzeko');
  });
  it('flattenSearchResponse title fallback chains', () => {
    const data = { clubs: [{ id: 'c1', name: 'FKG' }], matches: [{ id: 'm1', homeClub: { name: 'Borac' }, awayClub: { name: 'FKG' } }], galleries: [{ id: 'g1' }] };
    const out = flattenSearchResponse(data);
    expect(out.find((x) => x.type === 'clubs')?.title).toBe('FKG');
    expect(out.find((x) => x.type === 'matches')?.title).toBe('Borac vs FKG');
    expect(out.find((x) => x.type === 'galleries')?.title).toBe('Rezultat');
  });
  it('flattenSearchResponse numeric id and skips empty', () => {
    const data = { news: [{ id: 123, title: 'Num' }, { title: 'NoId' }] as any };
    const out = flattenSearchResponse(data);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('123');
  });
  it('groupSearchItems orders and filters empty', () => {
    const items = [{ id: '1', type: 'clubs', title: 'C' }, { id: '2', type: 'news', title: 'N' }, { id: '3', type: 'players', title: 'P' }] as any;
    const grouped = groupSearchItems(items);
    expect(grouped.map((g) => g.type)).toEqual(['news', 'players', 'clubs']);
    expect(groupSearchItems([])).toEqual([]);
  });
  it('searchItemHref per type', () => {
    expect(searchItemHref({ id: '1', type: 'news', title: 'a', slug: 'moja' } as any)).toBe('/news/moja');
    expect(searchItemHref({ id: '1', type: 'news', title: 'a' } as any)).toBeNull();
    expect(searchItemHref({ id: 'p1', type: 'players', title: 'a' } as any)).toBe('/player/p1');
    expect(searchItemHref({ id: 'g1', type: 'galleries', title: 'a', slug: 'gal' } as any)).toBe('/gallery/gal');
    expect(searchItemHref({ id: 'm1', type: 'matches', title: 'a' } as any)).toBe('/live/m1');
  });
  it('searchItemHref clubs and heritage and unknown', () => {
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a', slug: 'club' } as any)).toBe('/clubs/club');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a' } as any)).toBe('/team');
    expect(searchItemHref({ id: 't1', type: 'trophies', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 't1', type: 'timeline', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 'h1', type: 'hallOfFame', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 'x', type: 'unknown', title: 'a' } as any)).toBeNull();
  });
  it('brand and darkColors theme', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.white).toBe('#FFFFFF');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.text).toBe('#F8FAFC');
    expect(colors).toBe(darkColors);
    expect(spacing.md).toBe(16);
    expect(typography.display.fontSize).toBe(34);
  });
  it('spacing and typography', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.xl).toBe(32);
    expect(typography.title.fontSize).toBe(24);
    expect(typography.caption.fontSize).toBe(13);
    expect(darkColors.link).toBe('#93C5FD');
  });
});
