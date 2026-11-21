import { describe, expect, it } from 'vitest';
import { stripHtml, htmlToParagraphs } from './html-text';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { brand, darkColors, colors, spacing, typography } from './theme';

describe('mob-batch113 — P-MOB26 html/search/theme (test-only)', () => {
  it('stripHtml br and p newlines', () => {
    expect(stripHtml('a<br>b')).toBe('a\nb');
    expect(stripHtml('a<br/>b')).toBe('a\nb');
    expect(stripHtml('<p>hi</p>there')).toBe('hi\nthere');
    expect(stripHtml('<P>UP</P>')).toBe('UP');
  });
  it('stripHtml strips tags', () => {
    expect(stripHtml('<b>bold</b> <i>it</i>')).toBe('bold it');
    expect(stripHtml('<div>hello</div>')).toBe('hello');
    expect(stripHtml('plain text')).toBe('plain text');
  });
  it('stripHtml decodes entities', () => {
    expect(stripHtml('a &amp; b')).toBe('a & b');
    expect(stripHtml('&lt;tag&gt;')).toBe('<tag>');
    expect(stripHtml('&quot;hi&quot;')).toBe('"hi"');
    expect(stripHtml('&#65;')).toBe('A');
  });
  it('stripHtml nbsp and hex', () => {
    expect(stripHtml('a&nbsp;b')).toBe('a b');
    expect(stripHtml('&#x41;')).toBe('A');
    expect(stripHtml('&#X41;')).toBe('A');
    expect(stripHtml('&apos;')).toBe("'");
  });
  it('stripHtml unknown and collapse', () => {
    expect(stripHtml('&unknown;')).toBe('');
    expect(stripHtml('x<br><br><br>y')).toBe('x\n\ny');
    expect(stripHtml('  hello  ')).toBe('hello');
    expect(stripHtml('')).toBe('');
  });
  it('htmlToParagraphs splits and trims', () => {
    expect(htmlToParagraphs('<p>first</p><p>second</p>')).toEqual(['first', 'second']);
    expect(htmlToParagraphs('a<br>b<br>c')).toEqual(['a', 'b', 'c']);
    expect(htmlToParagraphs('<p>  hi  </p>')).toEqual(['hi']);
  });
  it('htmlToParagraphs empty filter', () => {
    expect(htmlToParagraphs('')).toEqual([]);
    expect(htmlToParagraphs('<p></p>')).toEqual([]);
    expect(htmlToParagraphs('a<br><br>b')).toEqual(['a', 'b']);
  });
  it('flattenSearchResponse invalid', () => {
    expect(flattenSearchResponse(null)).toEqual([]);
    expect(flattenSearchResponse(undefined)).toEqual([]);
    expect(flattenSearchResponse('str')).toEqual([]);
    expect(flattenSearchResponse({})).toEqual([]);
  });
  it('flattenSearchResponse news and players fallback', () => {
    const data = { news: [{ id: 'n1', title: 'Vijest', slug: 'vijest' }], players: [{ id: 'p1', firstName: 'M', lastName: 'Test' }] } as any;
    const out = flattenSearchResponse(data);
    expect(out.find((o) => o.id === 'n1')).toEqual({ id: 'n1', type: 'news', title: 'Vijest', slug: 'vijest' });
    expect(out.find((o) => o.id === 'p1')?.title).toBe('M Test');
  });
  it('flattenSearchResponse homeAway and skip', () => {
    const data = { matches: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } }], news: [{ title: 'NoId' }] } as any;
    const out = flattenSearchResponse(data);
    expect(out.find((o) => o.id === 'm1')?.title).toBe('A vs B');
    expect(out.find((o) => o.type === 'news' && (o as any).title === 'NoId')).toBeUndefined();
  });
  it('flattenSearchResponse numeric id', () => {
    const out = flattenSearchResponse({ galleries: [{ id: 99, name: 'Gal' }] } as any);
    expect(out[0].id).toBe('99');
    expect(out[0].type).toBe('galleries');
  });
  it('groupSearchItems orders', () => {
    const items = [
      { id: 'm1', type: 'matches', title: 'M' },
      { id: 'n1', type: 'news', title: 'N' },
      { id: 'p1', type: 'players', title: 'P' },
    ] as any;
    const groups = groupSearchItems(items);
    expect(groups.map((g) => g.type)).toEqual(['news', 'players', 'matches']);
    expect(groupSearchItems([])).toEqual([]);
  });
  it('searchItemHref maps', () => {
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
  it('theme brand darkColors spacing typography', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.accent).toBe('#2563EB');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.surface).toBe('#0A1525');
    expect(colors).toBe(darkColors);
    expect(spacing.md).toBe(16);
    expect(typography.title.fontSize).toBe(24);
  });
  it('theme typography full', () => {
    expect(typography.display.fontSize).toBe(34);
    expect(typography.heading.fontSize).toBe(18);
    expect(typography.body.fontSize).toBe(16);
    expect(typography.caption.fontSize).toBe(13);
  });
});
