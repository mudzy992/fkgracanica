import { describe, expect, it } from 'vitest';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { leagueEditionId, mapCalendarEditions, mapCalendarSeasons, pickDefaultEditionId, pickDefaultLeagueSeasonId } from './league-season';
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from './ticketing-status';

describe('mob-batch128 — P-MOB41 domain (test-only)', () => {
  it('pickDefaultParticipation prefers active league newest', () => {
    const items = [
      { seasonId: 's1', seasonName: '22', yearStart: 2022, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: 's2', seasonName: '23', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'Liga A', isLeague: true },
      { seasonId: 's3', seasonName: '24', yearStart: 2024, isActive: true, competitionId: 'c3', competitionName: 'Liga B', isLeague: true },
    ] as any;
    expect(pickDefaultParticipation(items)?.seasonId).toBe('s3');
  });
  it('pickDefaultParticipation fallback to newest active when no active league', () => {
    const items = [
      { seasonId: 's1', seasonName: '22', yearStart: 2022, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: 's2', seasonName: '23', yearStart: 2023, isActive: false, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
    ] as any;
    expect(pickDefaultParticipation(items)?.seasonId).toBe('s1');
  });
  it('pickDefaultParticipation fallback to newest overall when no active', () => {
    const items = [
      { seasonId: 's1', seasonName: '20', yearStart: 2020, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: true },
      { seasonId: 's2', seasonName: '21', yearStart: 2021, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: false },
    ] as any;
    expect(pickDefaultParticipation(items)?.seasonId).toBe('s2');
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
  it('activeSeasonCompetitions without active uses all', () => {
    const items = [
      { seasonId: 's1', seasonName: 'S1', yearStart: 2020, isActive: false, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: 's2', seasonName: 'S2', yearStart: 2021, isActive: false, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
    ] as any;
    const out = activeSeasonCompetitions(items);
    expect(out.length).toBe(2);
    expect(out[0].isLeague).toBe(true);
  });
  it('mapCalendarSeasons maps and filters empty id', () => {
    const data = [{ id: 's1', name: '2024/25', isActive: true }, { id: '', name: 'Bad' }] as any;
    expect(mapCalendarSeasons(data)).toEqual([{ id: 's1', name: '2024/25', isActive: true }]);
  });
  it('mapCalendarSeasons fallback Sezona', () => {
    expect(mapCalendarSeasons([{ id: 's1' }] as any)[0].name).toBe('Sezona');
    expect(mapCalendarSeasons([{ id: 's1', name: '', isActive: false }] as any)[0].name).toBe('');
  });
  it('mapCalendarSeasons empty and null', () => {
    expect(mapCalendarSeasons([])).toEqual([]);
    expect(mapCalendarSeasons(null)).toEqual([]);
    expect(mapCalendarSeasons(undefined)).toEqual([]);
  });
  it('mapCalendarEditions sorts league first', () => {
    const cal = { competitions: [{ id: 'e1', competition: { name: 'Kup', isLeague: false } }, { id: 'e2', competition: { name: 'Liga', isLeague: true } }] } as any;
    const out = mapCalendarEditions(cal);
    expect(out[0].id).toBe('e2');
    expect(out[0].isLeague).toBe(true);
  });
  it('mapCalendarEditions fallback Takmičenje and empty', () => {
    const cal = { competitions: [{ id: 'e1', competition: {} }] } as any;
    expect(mapCalendarEditions(cal)[0].name).toBe('Takmičenje');
    expect(mapCalendarEditions({})).toEqual([]);
    expect(mapCalendarEditions(null)).toEqual([]);
  });
  it('pickDefaultEditionId prefers selected and league fallback', () => {
    const eds = [{ id: 'e1', isLeague: false }, { id: 'e2', isLeague: true }] as any;
    expect(pickDefaultEditionId(eds, 'e1')).toBe('e1');
    expect(pickDefaultEditionId(eds, 'missing')).toBe('e2');
    expect(pickDefaultEditionId(eds)).toBe('e2');
    expect(pickDefaultEditionId([])).toBe('');
    expect(pickDefaultEditionId([{ id: 'e1', isLeague: false } as any])).toBe('e1');
  });
  it('leagueEditionId and pickDefaultLeagueSeasonId', () => {
    expect(leagueEditionId({ competitions: [{ id: 'e1', competition: { name: 'Liga', isLeague: true } }] } as any)).toBe('e1');
    expect(leagueEditionId({})).toBe('');
    const seasons = [{ id: 's1', isActive: false }, { id: 's2', isActive: true }] as any;
    expect(pickDefaultLeagueSeasonId(seasons)).toBe('s2');
    expect(pickDefaultLeagueSeasonId(seasons, 's1')).toBe('s1');
    expect(pickDefaultLeagueSeasonId([])).toBe('');
  });
  it('canShowTicketQr and canShowSeasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('PAID')).toBe(false);
    expect(canShowTicketQr('')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('PENDING')).toBe(false);
  });
  it('canPayOrderOnline requires pending with all RESERVED', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }] } as any)).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] } as any)).toBe(false);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] } as any)).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'PAID' }] } as any)).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'RESERVED' }] } as any)).toBe(true);
  });
  it('canCancelOrder only pending', () => {
    expect(canCancelOrder({ status: 'pending' } as any)).toBe(true);
    expect(canCancelOrder({ status: 'paid' } as any)).toBe(false);
    expect(canCancelOrder({ status: 'cancelled' } as any)).toBe(false);
    expect(canCancelOrder({ status: '' } as any)).toBe(false);
  });
});
