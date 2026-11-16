import { describe, expect, it } from 'vitest';
import { extractYears, groupHofByYear, museumCategoryKey, sortStoryChapters, splitFeaturedTrophy } from '../components/heritage/heritage-utils';
import { filterMuseum, museumCategories, museumYears, splitFeaturedMuseum } from '../components/heritage/museum-filter';
import { normalizeSponsorTier, SPONSOR_TIER_ACCENT, SPONSOR_TIER_ORDER } from '../components/heritage/sponsor-tiers';
import { homeInset, homeRadius, homeSurface } from '../components/home/home-surface';

const hof = (over: Partial<Record<string, unknown>>) => ({ id: '1', title: 'A', years: '2020', ...over } as never);

describe('mob-batch25 — P-MOB25 heritage + home-surface', () => {
  it('splitFeaturedTrophy prazno i featured', () => {
    expect(splitFeaturedTrophy([]).featured).toBeNull();
    const items = [{ id: '1', featured: true }, { id: '2', featured: false }, { id: '3' }] as never[];
    const { featured, rest } = splitFeaturedTrophy(items as never);
    expect(featured.id).toBe('1');
    expect(rest.length).toBe(2);
  });

  it('splitFeaturedTrophy fallback image+description pa prvi', () => {
    const a = { id: '1', imagePath: '/a.jpg', description: 'desc' } as never;
    const b = { id: '2' } as never;
    expect(splitFeaturedTrophy([b, a] as never).featured.id).toBe('1');
    expect(splitFeaturedTrophy([b] as never).featured.id).toBe('2');
  });

  it('sortStoryChapters i extractYears', () => {
    const items = [{ year: 2021, sortOrder: 2, title: 'B' }, { year: 2020, sortOrder: 1, title: 'A' }, { year: 2021, sortOrder: 1, title: 'C' }] as never[];
    const sorted = sortStoryChapters(items as never);
    expect(sorted[0].year).toBe(2020);
    expect(sorted[1].sortOrder).toBe(1);
    expect(extractYears('od 1999 do 2021')).toEqual(['1999', '2021']);
    expect(extractYears(undefined)).toEqual([]);
    expect(extractYears('nema')).toEqual([]);
  });

  it('groupHofByYear grupiše i sortira', () => {
    const items = [{ id: '1', title: 'Zebra', years: '2021' }, { id: '2', title: 'Apple', years: '2021' }, { id: '3', title: 'B', years: '2020' }, { id: '4', title: 'C', years: '' }] as never[];
    const grouped = groupHofByYear(items as never);
    expect(grouped[0].year).toBe('2021');
    expect(grouped[0].items[0].title).toBe('Apple');
    expect(grouped.find((g) => g.year === '')?.items.length).toBe(1);
  });

  it('museumCategoryKey normalizuje', () => {
    expect(museumCategoryKey('artifact')).toBe('museumArtifact');
    expect(museumCategoryKey('PHOTO')).toBe('museumPhoto');
    expect(museumCategoryKey('nepoznato')).toBe('museumOther');
    expect(museumCategoryKey(undefined)).toBe('museumOther');
  });

  it('museumYears i museumCategories', () => {
    const items = [{ year: 2021, category: 'photo' }, { year: 2020, category: 'artifact' }, { year: 2021, category: 'photo' }, { year: null, category: '' }] as never[];
    expect(museumYears(items as never)).toEqual([2021, 2020]);
    expect(museumCategories(items as never)).toEqual(['artifact', 'photo']);
  });

  it('filterMuseum filtrira po godini/kategoriji', () => {
    const items = [{ year: 2021, category: 'a' }, { year: 2020, category: 'b' }, { year: 2021, category: 'b' }] as never[];
    expect(filterMuseum(items as never, 2021).length).toBe(2);
    expect(filterMuseum(items as never, undefined, 'b').length).toBe(2);
    expect(filterMuseum(items as never, 2021, 'b').length).toBe(1);
    expect(filterMuseum(items as never).length).toBe(3);
  });

  it('splitFeaturedMuseum featured logika', () => {
    expect(splitFeaturedMuseum([]).featured).toBeNull();
    const items = [{ id: '1', imagePath: '/x' }, { id: '2' }] as never[];
    expect(splitFeaturedMuseum(items as never).featured.id).toBe('1');
    const feat = [{ id: '1', featured: true }, { id: '2', imagePath: '/y' }] as never[];
    expect(splitFeaturedMuseum(feat as never).featured.id).toBe('1');
  });

  it('normalizeSponsorTier i konstante', () => {
    expect(normalizeSponsorTier('GOLD')).toBe('GOLD');
    expect(normalizeSponsorTier('nepoznato')).toBe('PARTNER');
    expect(normalizeSponsorTier(undefined)).toBe('PARTNER');
    expect(SPONSOR_TIER_ORDER).toContain('GENERAL');
    expect(SPONSOR_TIER_ACCENT.GOLD).toBe('#C9A227');
  });

  it('homeSurface live vs običan', () => {
    const colors = { background: '#fff', surface: '#eee' } as never;
    const live = homeSurface(colors, true);
    const plain = homeSurface(colors, false);
    expect(live.backgroundColor).toBe('#fff');
    expect(live.borderRadius).toBe(homeRadius);
    expect(live.elevation).toBe(3);
    expect(plain.elevation).toBe(2);
    expect(live.shadowOpacity).toBe(0.12);
    expect(plain.shadowOpacity).toBe(0.06);
  });

  it('homeInset vraća surface', () => {
    const colors = { surface: '#abc' } as never;
    const s = homeInset(colors);
    expect(s.backgroundColor).toBe('#abc');
    expect(s.borderRadius).toBe(14);
  });
});
