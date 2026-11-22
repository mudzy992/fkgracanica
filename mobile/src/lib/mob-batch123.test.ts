import { describe, expect, it } from 'vitest';
import { htmlToParagraphs, stripHtml } from './html-text';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { brand, colors, darkColors, spacing, typography } from './theme';

describe('mob-batch123 — P-MOB36 html/search/theme (test-only)', () => {
  it('stripHtml empty and plain text', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml('plain text')).toBe('plain text');
  });
  it('stripHtml handles br and p as newline', () => {
    expect(stripHtml('<p>Hello</p>World')).toContain('Hello');
    expect(stripHtml('a<br>b')).toBe('a\nb');
    expect(stripHtml('a<br/>b')).toBe('a\nb');
    expect(stripHtml('a<BR>b')).toBe('a\nb');
  });
  it('stripHtml decodes amp lt gt quot apos nbsp', () => {
    expect(stripHtml('A &amp; B')).toBe('A & B');
    expect(stripHtml('&lt;x&gt;')).toBe('<x>');
    expect(stripHtml('&quot;hi&quot;')).toBe('"hi"');
    expect(stripHtml("a&apos;b")).toBe("a'b");
    expect(stripHtml('a&nbsp;b')).toBe('a b');
  });
  it('stripHtml numeric entities dec and hex', () => {
    expect(stripHtml('&#65;')).toBe('A');
    expect(stripHtml('&#x41;')).toBe('A');
    expect(stripHtml('&#x61;')).toBe('a');
    expect(stripHtml('&#9999;')).toBe(String.fromCharCode(9999));
  });
  it('stripHtml removes unknown entity and collapses triple newline', () => {
    expect(stripHtml('a &unknown; b')).toBe('a  b');
    expect(stripHtml('<p>a</p><p></p><p></p><p>b</p>')).not.toContain('\n\n\n');
    expect(stripHtml('<b>bold</b> text')).toBe('bold text');
  });
  it('htmlToParagraphs splits and trims', () => {
    expect(htmlToParagraphs('<p>Prvi</p><p>Drugi</p>')).toEqual(['Prvi', 'Drugi']);
    expect(htmlToParagraphs('a<br><br>b')).toEqual(['a', 'b']);
    expect(htmlToParagraphs('')).toEqual([]);
    expect(htmlToParagraphs('<p>  spaced  </p>')).toEqual(['spaced']);
  });
  it('flattenSearchResponse returns [] for invalid input', () => {
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse(undefined)).toEqual([]);
    expect(flattenSearchResponse('string')).toEqual([]);
    expect(flattenSearchResponse({})).toEqual([]);
  });
  it('flattenSearchResponse maps news and players with title fallback', () => {
    const data = { news: [{ id: 'n1', title: 'Vijest', slug: 'vijest' }], players: [{ id: 'p1', firstName: 'Edin', lastName: 'Dzeko' }] };
    const out = flattenSearchResponse(data);
    expect(out.find((x) => x.type === 'news')).toEqual(expect.objectContaining({ id: 'n1', title: 'Vijest', slug: 'vijest' }));
    expect(out.find((x) => x.type === 'players')?.title).toBe('Edin Dzeko');
  });
  it('flattenSearchResponse titleFrom fallback chains', () => {
    const data = {
      clubs: [{ id: 'c1', name: 'FKG' }],
      matches: [{ id: 'm1', homeClub: { name: 'Borac' }, awayClub: { name: 'FKG' } }],
      galleries: [{ id: 'g1' }],
    };
    const out = flattenSearchResponse(data);
    expect(out.find((x) => x.type === 'clubs')?.title).toBe('FKG');
    expect(out.find((x) => x.type === 'matches')?.title).toBe('Borac vs FKG');
    expect(out.find((x) => x.type === 'galleries')?.title).toBe('Rezultat');
  });
  it('flattenSearchResponse stringifies numeric id and skips empty id', () => {
    const data = { news: [{ id: 123, title: 'Num' }, { title: 'NoId' }] as any };
    const out = flattenSearchResponse(data);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('123');
    expect(out[0].slug).toBeUndefined();
  });
  it('groupSearchItems orders by fixed order and filters empty', () => {
    const items = [
      { id: '1', type: 'clubs', title: 'C' },
      { id: '2', type: 'news', title: 'N' },
      { id: '3', type: 'players', title: 'P' },
    ] as any;
    const grouped = groupSearchItems(items);
    expect(grouped.map((g) => g.type)).toEqual(['news', 'players', 'clubs']);
    expect(groupSearchItems([])).toEqual([]);
  });
  it('searchItemHref returns correct hrefs per type', () => {
    expect(searchItemHref({ id: '1', type: 'news', title: 'a', slug: 'moja' } as any)).toBe('/news/moja');
    expect(searchItemHref({ id: '1', type: 'news', title: 'a' } as any)).toBeNull();
    expect(searchItemHref({ id: 'p1', type: 'players', title: 'a' } as any)).toBe('/player/p1');
    expect(searchItemHref({ id: 'g1', type: 'galleries', title: 'a', slug: 'gal' } as any)).toBe('/gallery/gal');
    expect(searchItemHref({ id: 'g1', type: 'galleries', title: 'a' } as any)).toBeNull();
    expect(searchItemHref({ id: 'm1', type: 'matches', title: 'a' } as any)).toBe('/live/m1');
  });
  it('searchItemHref clubs/trophies/timeline/hallOfFame and unknown', () => {
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a', slug: 'club' } as any)).toBe('/clubs/club');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: 'a' } as any)).toBe('/team');
    expect(searchItemHref({ id: 't1', type: 'trophies', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 't1', type: 'timeline', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 'h1', type: 'hallOfFame', title: 'a' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 'x', type: 'unknown', title: 'a' } as any)).toBeNull();
  });
  it('theme brand and darkColors', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.white).toBe('#FFFFFF');
    expect(brand.primaryLight).toBe('#93C5FD');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.text).toBe('#F8FAFC');
    expect(darkColors.border).toBe('#334155');
    expect(darkColors.link).toBe('#93C5FD');
    expect(colors).toBe(darkColors);
    expect(colors.background).toBe(darkColors.background);
  });
  it('theme spacing and typography', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.md).toBe(16);
    expect(spacing.xl).toBe(32);
    expect(typography.display.fontSize).toBe(34);
    expect(typography.title.fontWeight).toBe('700');
    expect(typography.caption.fontSize).toBe(13);
  });
});
