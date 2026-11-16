import { describe, expect, it } from 'vitest';
import { flattenSearchResponse, groupSearchItems, searchItemHref } from './search-nav';
import { formatMatchTime, formatMatchDayLabel } from '../components/home/format-match-display';
import { darkColors, spacing, typography } from './theme';
describe('mob-batch48 — P-MOB48 search-nav/format/theme', () => {
  it('flattenSearchResponse', () => {
    const r = flattenSearchResponse({ news:[{id:'1',title:'A',slug:'a'}], players:[{id:'2',firstName:'E',lastName:'D'}], matches:[{id:'3',homeClub:{name:'X'},awayClub:{name:'Y'}}] });
    expect(r).toHaveLength(3); expect(r[0].title).toBe('A'); expect(r[1].title).toBe('E D'); expect(r[2].title).toBe('X vs Y');
  });
  it('flattenSearchResponse empty', () => { expect(flattenSearchResponse(null)).toEqual([]); expect(flattenSearchResponse({})).toEqual([]); });
  it('groupSearchItems', () => {
    const items = [{id:'1',title:'a',type:'news'},{id:'2',title:'b',type:'news'},{id:'3',title:'c',type:'players'}] as const;
    const g = groupSearchItems(items as unknown as import('./search-nav').SearchNavItem[]);
    expect(g[0].type).toBe('news'); expect(g[0].data).toHaveLength(2);
  });
  it('searchItemHref', () => {
    expect(searchItemHref({id:'1',title:'a',type:'news',slug:'s'})).toBe('/news/s');
    expect(searchItemHref({id:'2',title:'b',type:'players'})).toBe('/player/2');
    expect(searchItemHref({id:'x',title:'x',type:'unknown'})).toBeNull();
  });
  it('searchItemHref clubs fallback', () => { expect(searchItemHref({id:'1',title:'a',type:'clubs'})).toBe('/team'); });
  it('formatMatchTime', () => { expect(formatMatchTime('2026-01-01T12:34:00Z')).toMatch(/\d\d:\d\d/); });
  it('formatMatchDayLabel', () => { expect(formatMatchDayLabel('2026-01-01T12:00:00Z','bs')).toContain('·'); });
  it('darkColors', () => { expect(darkColors.primary).toBe('#1E3A8A'); expect(darkColors.background).toBe('#050A14'); });
  it('spacing', () => { expect(spacing.md).toBe(16); });
  it('typography', () => { expect(typography.title.fontSize).toBe(24); });
  it('searchItemHref galleries', () => { expect(searchItemHref({id:'1',title:'a',type:'galleries',slug:'g'})).toBe('/gallery/g'); });
});
