import { describe, expect, it } from 'vitest';
import { editionLabel, findEdition, leagueEdition, pickDefaultCalendarId, pickDefaultSeasonId, seasonLabel, sortedEditions, type CalendarSeason } from './season-utils';

describe('sezone i izdanja takmičenja', () => {
  const cup = { id: 'cup', competitionId: 'c1', competition: { name: 'Kup', isLeague: false } };
  const league = { id: 'league', competitionId: 'c2', competition: { name: 'Liga', isLeague: true } };
  const old: CalendarSeason = { id: 'old', name: 'Stara', yearStart: 2020, yearEnd: 2021, competitions: [cup] };
  const active: CalendarSeason = { id: 'active', name: 'Tekuća', isActive: true, yearStart: 2024, yearEnd: 2025, competitions: [cup, league] };
  const newer: CalendarSeason = { id: 'newer', name: 'Nova', yearStart: 2026 };

  it('aktivna sezona ima prednost, inače se bira najnovija bez mijenjanja ulaza', () => {
    const input = [old, newer, active];
    expect(pickDefaultCalendarId(input)).toBe('active');
    expect(pickDefaultSeasonId(input)).toBe('active');
    expect(pickDefaultCalendarId([old, newer])).toBe('newer');
    expect(pickDefaultCalendarId([])).toBeUndefined();
    expect(input.map((s) => s.id)).toEqual(['old', 'newer', 'active']);
  });

  it('liga ima prednost pri sortiranju i odabiru, uz siguran fallback', () => {
    expect(leagueEdition(active)).toEqual(league);
    expect(leagueEdition(old)).toEqual(cup);
    expect(leagueEdition()).toBeUndefined();
    expect(sortedEditions(active)).toEqual([league, cup]);
    expect(active.competitions).toEqual([cup, league]);
    expect(sortedEditions()).toEqual([]);
    expect(editionLabel(cup)).toBe('Kup');
    expect(editionLabel({ id: 'x', competitionId: 'x' })).toBe('Takmičenje');
  });

  it('nedostajući isLeague ne smije potisnuti ligu', () => {
    const missingFlag = { ...cup, competition: { name: 'Kup' } };
    expect(sortedEditions({ ...active, competitions: [missingFlag, league] })).toEqual([league, missingFlag]);
    const missingCompetition = { id: 'unknown', competitionId: 'c3' };
    expect(sortedEditions({ ...active, competitions: [missingCompetition, league] })).toEqual([league, missingCompetition]);
    expect(sortedEditions({ ...active, competitions: [league, missingFlag] })).toEqual([league, missingFlag]);
  });

  it('označava sezonu i traži izdanje samo unutar njegove kalendarske sezone', () => {
    expect(seasonLabel(active)).toBe('Tekuća (2024/2025)');
    expect(seasonLabel(newer)).toBe('Nova');
    expect(findEdition([old, active], 'league')).toEqual({ calendar: active, edition: league });
    expect(findEdition([old], 'missing')).toBeUndefined();
  });
});
