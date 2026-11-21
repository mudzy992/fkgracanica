import { describe, expect, it } from 'vitest';
import { pickDefaultParticipation, activeSeasonCompetitions } from './club-participation';
import { mapCalendarSeasons, mapCalendarEditions, pickDefaultEditionId, pickDefaultLeagueSeasonId, leagueEditionId } from './league-season';
import { matchStatusKey, matchMetaLine } from './match-status';
import { canShowTicketQr, canPayOrderOnline, canCancelOrder, canShowSeasonQr } from './ticketing-status';

describe('mob-batch111 — P-MOB24 domain club/league/match/ticketing (test-only)', () => {
  it('pickDefaultParticipation prefers activeLeague newest', () => {
    const items = [
      { seasonId: 's1', calendarSeasonId: 'c1', seasonName: '2022', yearStart: 2022, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: 's2', calendarSeasonId: 'c2', seasonName: '2023', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'Liga A', isLeague: true },
      { seasonId: 's3', calendarSeasonId: 'c3', seasonName: '2024', yearStart: 2024, isActive: true, competitionId: 'c3', competitionName: 'Liga B', isLeague: true },
    ] as any;
    expect(pickDefaultParticipation(items)?.seasonId).toBe('s3');
  });
  it('pickDefaultParticipation falls back to active then all', () => {
    const activeOnly = [
      { seasonId: 's1', seasonName: '2022', yearStart: 2022, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: 's2', seasonName: '2023', yearStart: 2023, isActive: false, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
    ] as any;
    expect(pickDefaultParticipation(activeOnly)?.seasonId).toBe('s1');
    const allInactive = [
      { seasonId: 's1', seasonName: '2020', yearStart: 2020, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: true },
      { seasonId: 's2', seasonName: '2021', yearStart: 2021, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: false },
    ] as any;
    expect(pickDefaultParticipation(allInactive)?.seasonId).toBe('s2');
    expect(pickDefaultParticipation([])).toBeUndefined();
  });
  it('activeSeasonCompetitions sorts league first then name', () => {
    const items = [
      { seasonId: 's1', seasonName: 'S1', yearStart: 2023, isActive: true, competitionId: 'c1', competitionName: 'Zebra', isLeague: false },
      { seasonId: 's2', seasonName: 'S2', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'Alpha', isLeague: true },
      { seasonId: 's3', seasonName: 'S3', yearStart: 2023, isActive: true, competitionId: 'c3', competitionName: 'Beta', isLeague: true },
    ] as any;
    const out = activeSeasonCompetitions(items);
    expect(out[0].competitionName).toBe('Alpha');
    expect(out[1].competitionName).toBe('Beta');
    expect(out[2].competitionName).toBe('Zebra');
  });
  it('activeSeasonCompetitions uses all when no active', () => {
    const items = [
      { seasonId: 's1', seasonName: 'S1', yearStart: 2020, isActive: false, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: 's2', seasonName: 'S2', yearStart: 2021, isActive: false, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
    ] as any;
    const out = activeSeasonCompetitions(items);
    expect(out[0].isLeague).toBe(true);
  });
  it('mapCalendarSeasons maps and filters', () => {
    const data = [{ id: 's1', name: '2024/25', isActive: true }, { id: '', name: 'Bad' }, { name: 'NoId' }] as any;
    const out = mapCalendarSeasons(data);
    expect(out).toEqual([{ id: 's1', name: '2024/25', isActive: true }]);
    expect(mapCalendarSeasons([])).toEqual([]);
    expect(mapCalendarSeasons(null)).toEqual([]);
  });
  it('mapCalendarSeasons fallback Sezona', () => {
    const out = mapCalendarSeasons([{ id: 's1' }] as any);
    expect(out[0].name).toBe('Sezona');
  });
  it('mapCalendarEditions maps and sorts league first', () => {
    const cal = { competitions: [{ id: 'e1', competition: { name: 'Kup', isLeague: false } }, { id: 'e2', competition: { name: 'Liga', isLeague: true } }] } as any;
    const out = mapCalendarEditions(cal);
    expect(out[0].id).toBe('e2');
    expect(out[1].id).toBe('e1');
  });
  it('mapCalendarEditions filters and fallback', () => {
    const cal = { competitions: [{ competition: { name: 'NoId' } }, { id: 'e1', competition: {} }] } as any;
    const out = mapCalendarEditions(cal);
    expect(out).toEqual([{ id: 'e1', name: 'Takmičenje', isLeague: false }]);
    expect(mapCalendarEditions({})).toEqual([]);
  });
  it('pickDefaultEditionId selected league first empty', () => {
    const eds = [{ id: 'e1', isLeague: false }, { id: 'e2', isLeague: true }] as any;
    expect(pickDefaultEditionId(eds, 'e1')).toBe('e1');
    expect(pickDefaultEditionId(eds, 'missing')).toBe('e2');
    expect(pickDefaultEditionId(eds)).toBe('e2');
    expect(pickDefaultEditionId([{ id: 'e1', isLeague: false }] as any)).toBe('e1');
    expect(pickDefaultEditionId([])).toBe('');
  });
  it('pickDefaultLeagueSeasonId and leagueEditionId', () => {
    const seasons = [{ id: 's1', isActive: false }, { id: 's2', isActive: true }] as any;
    expect(pickDefaultLeagueSeasonId(seasons)).toBe('s2');
    expect(pickDefaultLeagueSeasonId(seasons, 's1')).toBe('s1');
    expect(pickDefaultLeagueSeasonId([])).toBe('');
    expect(leagueEditionId({ competitions: [{ id: 'e1', competition: { name: 'Liga', isLeague: true } }] } as any)).toBe('e1');
  });
  it('matchStatusKey maps all statuses', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('HALFTIME')).toBe('matchHalftime');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished');
    expect(matchStatusKey('SCHEDULED')).toBe('matchScheduled');
    expect(matchStatusKey('POSTPONED')).toBe('matchPostponed');
    expect(matchStatusKey('CANCELLED')).toBe('matchCancelled');
    expect(matchStatusKey('UNKNOWN')).toBe('matchScheduled');
  });
  it('matchMetaLine competition and round', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Premijer' } }, roundRel: { number: 5, name: 'Kolo 5' } }, (n) => `Kolo ${n}`)).toBe('Premijer · Kolo 5');
    expect(matchMetaLine({ season: { competition: { name: 'Liga' } }, roundRel: null }, (n) => `Kolo ${n}`)).toBe('Liga');
    expect(matchMetaLine({ roundRel: { number: 0, name: 'Finale' } } as any, (n) => `Kolo ${n}`)).toBe('Finale');
    expect(matchMetaLine({}, (n) => `Kolo ${n}`)).toBe('');
  });
  it('ticketing canShowTicketQr and canShowSeasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('PAID')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('PENDING')).toBe(false);
  });
  it('canPayOrderOnline pending and tickets all reserved', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'RESERVED' }] })).toBe(true);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID' }] })).toBe(false);
  });
  it('canCancelOrder pending only', () => {
    expect(canCancelOrder({ status: 'pending' })).toBe(true);
    expect(canCancelOrder({ status: 'paid' })).toBe(false);
    expect(canCancelOrder({ status: 'cancelled' })).toBe(false);
  });
});
