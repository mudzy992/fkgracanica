import { describe, expect, it } from 'vitest';
import { matchMetaLine, matchStatusKey } from './match-status';
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from './ticketing-status';
import { leagueEditionId, mapCalendarEditions, mapCalendarSeasons, pickDefaultEditionId, pickDefaultLeagueSeasonId } from './league-season';

describe('mob-batch140 — P-MOB53 domain (test-only)', () => {
  it('matchStatusKey maps all', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('HALFTIME')).toBe('matchHalftime');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished');
    expect(matchStatusKey('SCHEDULED')).toBe('matchScheduled');
    expect(matchStatusKey('POSTPONED')).toBe('matchPostponed');
    expect(matchStatusKey('CANCELLED')).toBe('matchCancelled');
    expect(matchStatusKey('UNKNOWN')).toBe('matchScheduled');
  });
  it('matchStatusKey fallback empty', () => {
    expect(matchStatusKey('')).toBe('matchScheduled');
    expect(matchStatusKey('live')).toBe('matchScheduled');
  });
  it('matchMetaLine competition and round number', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Premijer' } }, roundRel: { number: 5, name: 'Kolo 5' } }, (n) => `Kolo ${n}`)).toBe('Premijer · Kolo 5');
  });
  it('matchMetaLine round name fallback when number 0', () => {
    expect(matchMetaLine({ roundRel: { number: 0, name: 'Finale' } } as any, (n) => `Kolo ${n}`)).toBe('Finale');
    expect(matchMetaLine({ roundRel: { number: -1, name: 'Finale' } } as any, (n) => `Kolo ${n}`)).toBe('Finale');
  });
  it('matchMetaLine only competition', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Kup' } } } as any, (n) => `Kolo ${n}`)).toBe('Kup');
  });
  it('matchMetaLine only round', () => {
    expect(matchMetaLine({ roundRel: { number: 3, name: null } } as any, (n) => `R${n}`)).toBe('R3');
    expect(matchMetaLine({} as any, (n) => `Kolo ${n}`)).toBe('');
  });
  it('matchMetaLine competition null safe', () => {
    expect(matchMetaLine({ season: null as any, roundRel: null } as any, (n) => `Kolo ${n}`)).toBe('');
    expect(matchMetaLine({ season: { competition: null } } as any, (n) => `Kolo ${n}`)).toBe('');
  });
  it('canShowTicketQr and canShowSeasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('PAID')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('PENDING')).toBe(false);
  });
  it('canPayOrderOnline pending reserved', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }] } as any)).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] } as any)).toBe(false);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] } as any)).toBe(false);
  });
  it('canPayOrderOnline all reserved required', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID' }] } as any)).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'RESERVED' }] } as any)).toBe(true);
  });
  it('canCancelOrder only pending', () => {
    expect(canCancelOrder({ status: 'pending' } as any)).toBe(true);
    expect(canCancelOrder({ status: 'paid' } as any)).toBe(false);
    expect(canCancelOrder({ status: '' } as any)).toBe(false);
  });
  it('mapCalendarSeasons maps and fallback', () => {
    expect(mapCalendarSeasons([{ id: 's1', name: '2024/25', isActive: true }] as any)).toEqual([{ id: 's1', name: '2024/25', isActive: true }]);
    expect(mapCalendarSeasons([{ id: 's1' }] as any)[0].name).toBe('Sezona');
    expect(mapCalendarSeasons(null)).toEqual([]);
  });
  it('mapCalendarEditions sorts league first', () => {
    const cal = { competitions: [{ id: 'e1', competition: { name: 'Kup', isLeague: false } }, { id: 'e2', competition: { name: 'Liga', isLeague: true } }] } as any;
    expect(mapCalendarEditions(cal)[0].id).toBe('e2');
    expect(mapCalendarEditions(cal)[0].isLeague).toBe(true);
  });
  it('pickDefaultEditionId and leagueEditionId', () => {
    const eds = [{ id: 'e1', isLeague: false }, { id: 'e2', isLeague: true }] as any;
    expect(pickDefaultEditionId(eds, 'e1')).toBe('e1');
    expect(pickDefaultEditionId(eds)).toBe('e2');
    expect(pickDefaultEditionId([])).toBe('');
    expect(leagueEditionId({ competitions: [{ id: 'e1', competition: { name: 'Liga', isLeague: true } }] } as any)).toBe('e1');
  });
  it('pickDefaultLeagueSeasonId selects active', () => {
    const seasons = [{ id: 's1', isActive: false }, { id: 's2', isActive: true }] as any;
    expect(pickDefaultLeagueSeasonId(seasons)).toBe('s2');
    expect(pickDefaultLeagueSeasonId(seasons, 's1')).toBe('s1');
    expect(pickDefaultLeagueSeasonId([])).toBe('');
  });
});
