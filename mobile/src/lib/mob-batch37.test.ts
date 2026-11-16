import { describe, expect, it } from 'vitest';
import { filterMuseum, museumCategories, museumYears, splitFeaturedMuseum } from '../components/heritage/museum-filter';
import { extractYears, groupHofByYear, museumCategoryKey, sortStoryChapters, splitFeaturedTrophy } from '../components/heritage/heritage-utils';
describe('mob-batch37 — P-MOB37 heritage utils', () => {
  it('museumYears dedup i sort desc', () => {
    expect(museumYears([{ year: 1990 } as any, { year: 1990 } as any, { year: 2000 } as any, {} as any])).toEqual([2000, 1990]);
  });
  it('museumCategories dedup i sort', () => {
    expect(museumCategories([{ category: 'B' } as any, { category: 'A' } as any, { category: 'B' } as any])).toEqual(['A', 'B']);
  });
  it('filterMuseum year/category', () => {
    const items = [{ id: '1', year: 1990, category: 'A' } as any, { id: '2', year: 2000, category: 'B' } as any];
    expect(filterMuseum(items, 1990)).toEqual([items[0]]); expect(filterMuseum(items, undefined, 'B')).toEqual([items[1]]);
    expect(filterMuseum(items, 1990, 'B')).toEqual([]);
  });
  it('splitFeaturedMuseum featured/imagePath/fallback', () => {
    expect(splitFeaturedMuseum([])).toEqual({ featured: null, rest: [] });
    const withFeat = [{ id: '1', featured: true }, { id: '2', imagePath: '/a.png' }, { id: '3' }] as any;
    expect(splitFeaturedMuseum(withFeat).featured?.id).toBe('1'); expect(splitFeaturedMuseum(withFeat).rest.length).toBe(2);
    expect(splitFeaturedMuseum([{ id: '2', imagePath: '/a.png' }, { id: '3' }] as any).featured?.id).toBe('2');
    expect(splitFeaturedMuseum([{ id: '3' }, { id: '4' }] as any).featured?.id).toBe('3');
  });
  it('splitFeaturedTrophy featured/description fallback', () => {
    expect(splitFeaturedTrophy([]).featured).toBeNull();
    const items = [{ id: '1', featured: true }, { id: '2', imagePath: '/a', description: 'd' }, { id: '3' }] as any;
    expect(splitFeaturedTrophy(items).featured?.id).toBe('1');
    expect(splitFeaturedTrophy([{ id: '2', imagePath: '/a', description: 'd' }, { id: '3' }] as any).featured?.id).toBe('2');
    expect(splitFeaturedTrophy([{ id: '3' }] as any).featured?.id).toBe('3');
  });
  it('sortStoryChapters sort year+sortOrder', () => {
    const r = sortStoryChapters([{ id: '2', year: 2000, sortOrder: 2 } as any, { id: '1', year: 1990 } as any, { id: '3', year: 2000, sortOrder: 1 } as any]);
    expect(r.map((x) => x.id)).toEqual(['1', '3', '2']);
  });
  it('extractYears match 4 digits', () => {
    expect(extractYears('1990-2000 abc')).toEqual(['1990', '2000']); expect(extractYears(undefined)).toEqual([]); expect(extractYears('no year')).toEqual([]);
  });
  it('groupHofByYear grupiše i sortira', () => {
    const r = groupHofByYear([{ id: '1', title: 'B', years: '1990' } as any, { id: '2', title: 'A', years: '1990' } as any, { id: '3', title: 'C', years: '2000' } as any, { id: '4', title: 'D', years: '' } as any]);
    expect(r[0].year).toBe('2000'); expect(r[1].items.map((x) => x.title)).toEqual(['A', 'B']);
    expect(r[2].year).toBe('');
  });
  it('museumCategoryKey mapping', () => {
    expect(museumCategoryKey('artifact')).toBe('museumArtifact'); expect(museumCategoryKey('PHOTO')).toBe('museumPhoto');
    expect(museumCategoryKey('unknown')).toBe('museumOther'); expect(museumCategoryKey(undefined)).toBe('museumOther');
  });
  it('filterMuseum bez filtera vraća sve', () => {
    const items = [{ id: '1' } as any, { id: '2' } as any];
    expect(filterMuseum(items)).toEqual(items);
  });
  it('groupHofByYear prazno', () => {
    expect(groupHofByYear([])).toEqual([]);
  });
});
