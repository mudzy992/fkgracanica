import { describe, expect, it } from 'vitest';
import { stripHtml, htmlToParagraphs } from './html-text';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { brand, darkColors, colors, spacing, typography } from './theme';

describe('mob-batch104 — P-MOB17 html/search/theme (test-only)', () => {
  it('stripHtml converts br and p to newlines', () => {
    expect(stripHtml('a<br/>b')).toBe('a\nb');
    expect(stripHtml('a<br />b')).toBe('a\nb');
    expect(stripHtml('<p>hello</p>world')).toBe('hello\nworld');
    expect(stripHtml('<P>upper</P>')).toBe('upper');
  });
  it('stripHtml strips remaining tags', () => {
    expect(stripHtml('<strong>bold</strong>')).toBe('bold');
    expect(stripHtml('<span class=\"x\">text</span>')).toBe('text');
    expect(stripHtml('plain')).toBe('plain');
  });
  it('stripHtml decodes basic entities', () => {
    expect(stripHtml('&amp;')).toBe('&');
    expect(stripHtml('&quot;')).toBe('"');
    expect(stripHtml('&apos;')).toBe("'");
    expect(stripHtml('&lt;&gt;')).toBe('<>');
  });
  it('stripHtml decodes nbsp and numeric entities', () => {
    expect(stripHtml('a&nbsp;b')).toBe('a b');
    expect(stripHtml('&#65;')).toBe('A');
    expect(stripHtml('&#x41;')).toBe('A');
    expect(stripHtml('&#X41;')).toBe('A');
  });
  it('stripHtml unknown entity and collapse newlines', () => {
    expect(stripHtml('&unknown;')).toBe('');
    expect(stripHtml('&foobar;test')).toBe('test');
    expect(stripHtml('x<br><br><br><br>y')).toBe('x\n\ny');
    expect(stripHtml('  spaced  ')).toBe('spaced');
  });
  it('stripHtml empty and only tags', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml('<br>')).toBe('');
    expect(stripHtml('<div></div>')).toBe('');
  });
  it('htmlToParagraphs splits on newlines and trims', () => {
    expect(htmlToParagraphs('<p>first</p><p>second</p>')).toEqual(['first', 'second']);
    expect(htmlToParagraphs('a<br>b<br>c')).toEqual(['a', 'b', 'c']);
    expect(htmlToParagraphs('<p>  spaced  </p>')).toEqual(['spaced']);
  });
  it('htmlToParagraphs filters empty', () => {
    expect(htmlToParagraphs('')).toEqual([]);
    expect(htmlToParagraphs('<p></p>')).toEqual([]);
    expect(htmlToParagraphs('a<br><br>b')).toEqual(['a', 'b']);
  });
  it('flattenSearchResponse returns empty for invalid input', () => {
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse(undefined)).toEqual([]);
    expect(flattenSearchResponse('str')).toEqual([]);
    expect(flattenSearchResponse({})).toEqual([]);
  });
  it('flattenSearchResponse maps news and players fallback title', () => {
    const data = { news: [{ id: 'n1', title: 'Vijest', slug: 'vijest' }], players: [{ id: 'p1', firstName: 'M', lastName: 'Test' }] } as any;
    const out = flattenSearchResponse(data);
    expect(out.find((o) => o.id === 'n1')).toEqual({ id: 'n1', type: 'news', title: 'Vijest', slug: 'vijest' });
    expect(out.find((o) => o.id === 'p1')?.title).toBe('M Test');
  });
  it('flattenSearchResponse uses name/homeAway and skips missing id', () => {
    const data = { clubs: [{ id: 'c1', name: 'FKG' }], matches: [{ id: 'm1', homeClub: { name: 'Home' }, awayClub: { name: 'Away' } }], galleries: [{ title: 'NoId' }] } as any;
    const out = flattenSearchResponse(data);
    expect(out.find((o) => o.id === 'c1')?.title).toBe('FKG');
    expect(out.find((o) => o.id === 'm1')?.title).toBe('Home vs Away');
    expect(out.find((o) => o.type === 'galleries')).toBeUndefined();
  });
  it('flattenSearchResponse handles numeric id as string', () => {
    const out = flattenSearchResponse({ trophies: [{ id: 42, name: 'Kup' }] } as any);
    expect(out[0].id).toBe('42');
    expect(out[0].type).toBe('trophies');
  });
  it('groupSearchItems orders by fixed order and filters', () => {
    const items = [
      { id: 'm1', type: 'matches', title: 'M' },
      { id: 'n1', type: 'news', title: 'N' },
      { id: 'p1', type: 'players', title: 'P' },
    ] as any;
    const groups = groupSearchItems(items);
    expect(groups.map((g) => g.type)).toEqual(['news', 'players', 'matches']);
    expect(groupSearchItems([])).toEqual([]);
  });
  it('searchItemHref maps all types', () => {
    expect(searchItemHref({ id: 'n1', type: 'news', title: '', slug: 'a' } as any)).toBe('/news/a');
    expect(searchItemHref({ id: 'n1', type: 'news', title: '' } as any)).toBeNull();
    expect(searchItemHref({ id: 'p1', type: 'players', title: '' } as any)).toBe('/player/p1');
    expect(searchItemHref({ id: 'g1', type: 'galleries', title: '', slug: 'gal' } as any)).toBe('/gallery/gal');
    expect(searchItemHref({ id: 'm1', type: 'matches', title: '' } as any)).toBe('/live/m1');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: '', slug: 'fk' } as any)).toBe('/clubs/fk');
    expect(searchItemHref({ id: 'c1', type: 'clubs', title: '' } as any)).toBe('/team');
    expect(searchItemHref({ id: 't1', type: 'trophies', title: '' } as any)).toBe('/heritage');
    expect(searchItemHref({ id: 'x', type: 'unknown', title: '' } as any)).toBeNull();
  });
  it('theme brand/darkColors/spacing/typography', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.accent).toBe('#2563EB');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.surface).toBe('#0A1525');
    expect(colors).toBe(darkColors);
    expect(spacing.md).toBe(16);
    expect(spacing.xl).toBe(32);
    expect(typography.title.fontSize).toBe(24);
    expect(typography.body.fontSize).toBe(16);
  });
});
