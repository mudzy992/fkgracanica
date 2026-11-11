import { describe, it, expect } from 'vitest';
import { pickDefaultCalendarId, seasonLabel, sortedEditions, type CalendarSeason } from './season-utils';

describe('fe06-batch69d season-utils preostale grane [??0, seasonLabel, sortedEditions fallback]', () => {
  it('pickDefaultCalendarId pokriva ?? 0 kada yearStart nedostaje [27,0]', () => {
    const seasons: CalendarSeason[] = [
      { id: 'a', name: 'A', yearStart: undefined },
      { id: 'b', name: 'B', yearStart: 2023 },
      { id: 'c', name: 'C' },
    ];
    // pool sorted descending by yearStart ?? 0, so b (2023) before a (0) before c (0)
    // but active empty, so pool = seasons sorted
    expect(pickDefaultCalendarId(seasons)).toBe('b');
    // also test active has missing yearStart
    const withActive: CalendarSeason[] = [
      { id: 'x', name: 'X', isActive: true, yearStart: undefined },
      { id: 'y', name: 'Y', isActive: true, yearStart: 2025 },
    ];
    expect(pickDefaultCalendarId(withActive)).toBe('y');
    // empty array
    expect(pickDefaultCalendarId([])).toBeUndefined();
  });

  it('seasonLabel pokriva && i ?: za yearStart/End', () => {
    expect(seasonLabel({ id: 's1', name: 'Test', yearStart: 2024, yearEnd: 2025 })).toBe('Test (2024/2025)');
    expect(seasonLabel({ id: 's2', name: 'SamoStart', yearStart: 2024 } as CalendarSeason)).toBe('SamoStart');
    expect(seasonLabel({ id: 's3', name: 'SamoEnd', yearEnd: 2025 } as unknown as CalendarSeason)).toBe('SamoEnd');
    expect(seasonLabel({ id: 's4', name: 'Bez' } as CalendarSeason)).toBe('Bez');
  });

  it('sortedEditions pokriva league || localeCompare fallback kada isLeague isti', () => {
    const cupA = { id: 'c1', competitionId: 'x1', competition: { name: 'Z Cup', isLeague: false } };
    const cupB = { id: 'c2', competitionId: 'x2', competition: { name: 'A Cup', isLeague: false } };
    const leagueA = { id: 'l1', competitionId: 'y1', competition: { name: 'Z Liga', isLeague: true } };
    const leagueB = { id: 'l2', competitionId: 'y2', competition: { name: 'A Liga', isLeague: true } };
    const season: CalendarSeason = { id: 's', name: 'S', competitions: [cupA, cupB] };
    // oba isLeague false => league diff 0 => fallback localeCompare A Cup vs Z Cup
    expect(sortedEditions(season).map((e) => e.id)).toEqual(['c2', 'c1']);
    const season2: CalendarSeason = { id: 's2', name: 'S2', competitions: [leagueA, leagueB] };
    expect(sortedEditions(season2).map((e) => e.id)).toEqual(['l2', 'l1']);
    // missing name fallback ?? ''
    const noName = { id: 'n1', competitionId: 'n', competition: { isLeague: false } } as unknown as CalendarSeason['competitions'] extends (infer U)[] ? U : never;
    // ensure no crash when name undefined
    expect(sortedEditions({ id: 's3', name: 'S3', competitions: [noName, cupA] } as CalendarSeason)).toBeDefined();
  });
});
