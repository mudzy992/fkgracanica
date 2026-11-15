import { describe, expect, it } from 'vitest';
import {
  extractYears,
  groupHofByYear,
  museumCategoryKey,
  sortStoryChapters,
  splitFeaturedTrophy,
} from '../components/heritage/heritage-utils';
import {
  filterMuseum,
  museumCategories,
  museumYears,
  splitFeaturedMuseum,
} from '../components/heritage/museum-filter';
import {
  normalizeSponsorTier,
  SPONSOR_TIER_ACCENT,
  SPONSOR_TIER_ORDER,
} from '../components/heritage/sponsor-tiers';
import { formatMatchDayLabel, formatMatchTime } from '../components/home/format-match-display';
import { homeInset, homeRadius, homeSurface } from '../components/home/home-surface';
import { darkColors } from './theme';
import type { HeritageItem } from '../components/heritage/load-heritage';

function item(over: Partial<HeritageItem> & { id: string; title: string }): HeritageItem {
  return { ...over } as HeritageItem;
}

describe('mob-batch11 — P-MOB11 heritage/home utils', () => {
  it('splitFeaturedTrophy prazno i featured', () => {
    expect(splitFeaturedTrophy([])).toEqual({ featured: null, rest: [] });
    const a = item({ id: '1', title: 'A', featured: true });
    const b = item({ id: '2', title: 'B' });
    const res = splitFeaturedTrophy([b, a]);
    expect(res.featured?.id).toBe('1');
    expect(res.rest.map((x) => x.id)).toEqual(['2']);
  });

  it('splitFeaturedTrophy fallback image+description pa prvi', () => {
    const a = item({ id: '1', title: 'A', imagePath: 'x', description: 'desc' });
    const b = item({ id: '2', title: 'B' });
    expect(splitFeaturedTrophy([b, a]).featured?.id).toBe('1');
    const c = item({ id: '3', title: 'C' });
    const d = item({ id: '4', title: 'D' });
    expect(splitFeaturedTrophy([c, d]).featured?.id).toBe('3');
  });

  it('sortStoryChapters sortira po year pa sortOrder', () => {
    const items = [
      item({ id: '1', title: 'A', year: 2021, sortOrder: 2 }),
      item({ id: '2', title: 'B', year: 2020, sortOrder: 1 }),
      item({ id: '3', title: 'C', year: 2020, sortOrder: 0 }),
    ];
    const sorted = sortStoryChapters(items);
    expect(sorted.map((x) => x.id)).toEqual(['3', '2', '1']);
  });

  it('extractYears i museumCategoryKey', () => {
    expect(extractYears(undefined)).toEqual([]);
    expect(extractYears('2020/2021 i 1999')).toEqual(['2020', '2021', '1999']);
    expect(museumCategoryKey('artifact')).toBe('museumArtifact');
    expect(museumCategoryKey('PHOTO')).toBe('museumPhoto');
    expect(museumCategoryKey('nepoznato')).toBe('museumOther');
    expect(museumCategoryKey(undefined)).toBe('museumOther');
  });

  it('groupHofByYear grupira i sortira', () => {
    const items = [
      item({ id: '1', title: 'B', years: '2020' }),
      item({ id: '2', title: 'A', years: '2020' }),
      item({ id: '3', title: 'C', years: '2021' }),
      item({ id: '4', title: 'D', years: '' }),
    ];
    const grouped = groupHofByYear(items);
    expect(grouped[0].year).toBe('2021');
    expect(grouped[1].year).toBe('2020');
    expect(grouped[1].items.map((x) => x.title)).toEqual(['A', 'B']);
  });

  it('museumYears/museumCategories/filterMuseum', () => {
    const items = [
      item({ id: '1', title: 'A', year: 2021, category: 'photo' }),
      item({ id: '2', title: 'B', year: 2020, category: 'artifact' }),
      item({ id: '3', title: 'C', year: 2021, category: 'photo' }),
    ];
    expect(museumYears(items)).toEqual([2021, 2020]);
    expect(museumCategories(items)).toEqual(['artifact', 'photo']);
    expect(filterMuseum(items, 2021).map((x) => x.id)).toEqual(['1', '3']);
    expect(filterMuseum(items, undefined, 'artifact').map((x) => x.id)).toEqual(['2']);
    expect(filterMuseum(items, 2021, 'photo').map((x) => x.id)).toEqual(['1', '3']);
  });

  it('splitFeaturedMuseum featured pa image pa prvi', () => {
    const a = item({ id: '1', title: 'A', featured: true });
    const b = item({ id: '2', title: 'B', imagePath: 'x' });
    const c = item({ id: '3', title: 'C' });
    expect(splitFeaturedMuseum([]).featured).toBeNull();
    expect(splitFeaturedMuseum([c, b]).featured?.id).toBe('2');
    expect(splitFeaturedMuseum([c, b, a]).featured?.id).toBe('1');
  });

  it('normalizeSponsorTier i konstante', () => {
    expect(SPONSOR_TIER_ORDER).toContain('GOLD');
    expect(normalizeSponsorTier('GOLD')).toBe('GOLD');
    expect(normalizeSponsorTier('UNKNOWN')).toBe('PARTNER');
    expect(normalizeSponsorTier(undefined)).toBe('PARTNER');
    expect(SPONSOR_TIER_ACCENT.GOLD).toBe('#C9A227');
    expect(SPONSOR_TIER_ACCENT.SILVER).toBe('#C0C7D1');
  });

  it('formatMatchTime vraća HH:MM', () => {
    // 2024-01-15T14:05:00.000Z -> local hours may vary, test pattern
    const res = formatMatchTime('2024-01-15T08:05:00.000Z');
    expect(res).toMatch(/^\d{2}:\d{2}$/);
  });

  it('formatMatchDayLabel vraća dan · datum', () => {
    const res = formatMatchDayLabel('2024-01-15T12:00:00.000Z', 'bs');
    expect(res).toContain('·');
    expect(res).toMatch(/\d+\.\s*\d+/);
  });

  it('homeSurface i homeInset', () => {
    const s1 = homeSurface(darkColors, false);
    const s2 = homeSurface(darkColors, true);
    expect(s1.backgroundColor).toBe(darkColors.background);
    expect(s1.borderRadius).toBe(homeRadius);
    expect(s1.elevation).toBe(2);
    expect(s2.elevation).toBe(3);
    expect(s2.shadowOpacity).toBeGreaterThan(s1.shadowOpacity as number);
    const inset = homeInset(darkColors);
    expect(inset.backgroundColor).toBe(darkColors.surface);
    expect(inset.borderRadius).toBe(14);
  });
});
