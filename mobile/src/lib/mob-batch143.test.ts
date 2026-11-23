import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { flattenSeasonEditions } from './flatten-editions';
import { mapCalendarEditions, mapCalendarSeasons, pickDefaultEditionId, pickDefaultLeagueSeasonId } from './league-season';
import { matchMetaLine, matchStatusKey } from './match-status';
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from './ticketing-status';

describe('mob-batch143 — P-MOB56 desk/flatten/ticketing/league/match (test-only)', () => {
  it('deskCounts live scheduled reports', () => {
    const r = deskCounts([
      { status: 'LIVE' }, { status: 'HALFTIME' }, { status: 'SCHEDULED' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' }, { status: 'FINISHED', reportStatus: 'APPROVED' },
    ]);
    expect(r).toEqual({ live: 2, scheduled: 1, reports: 1 });
    expect(deskCounts([])).toEqual({ live: 0, scheduled: 0, reports: 0 });
  });
  it('filterCommentatorDesk live and today', () => {
    const todayIso = new Date().toISOString();
    const out = filterCommentatorDesk([
      { status: 'LIVE' }, { status: 'SCHEDULED', scheduledAt: todayIso },
      { status: 'SCHEDULED', scheduledAt: '2000-01-01T00:00:00Z' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
    ] as any);
    expect(out.length).toBe(3);
    expect(out.some((m) => (m as any).scheduledAt === '2000-01-01T00:00:00Z')).toBe(false);
  });
  it('flattenSeasonEditions maps', () => {
    const data = [{ id: 'cal1', name: '2023/24', competitions: [{ id: 'ed1', competition: { name: 'Premijer' } }, { id: '', competition: { name: 'x' } }] }];
    const res = flattenSeasonEditions(data);
    expect(res.length).toBe(1);
    expect(res[0]).toMatchObject({ id: 'ed1', calendarId: 'cal1', calendarName: '2023/24' });
    expect(res[0].name).toContain('Premijer');
    expect(flattenSeasonEditions(null)).toEqual([]);
  });
  it('flattenSeasonEditions defaults', () => {
    const res = flattenSeasonEditions([{ id: 'c', competitions: [{ id: 'e', competition: {} }] }]);
    expect(res[0].name).toBe('Takmičenje · Sezona');
  });
  it('canShowTicketQr seasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('pending')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('EXPIRED')).toBe(false);
  });
  it('canPayOrderOnline pending reserved', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'RESERVED' }] })).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID_AT_BOX_OFFICE' }] })).toBe(false);
  });
  it('canPayOrderOnline empty and wrong status', () => {
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] })).toBe(false);
  });
  it('canCancelOrder', () => {
    expect(canCancelOrder({ status: 'pending' })).toBe(true);
    expect(canCancelOrder({ status: 'paid' })).toBe(false);
  });
  it('mapCalendarSeasons', () => {
    const s = mapCalendarSeasons([{ id: 's1', name: '2023', isActive: true }, { id: '', name: 'x' }, { name: 'no' }]);
    expect(s).toEqual([{ id: 's1', name: '2023', isActive: true }]);
    expect(mapCalendarSeasons([])).toEqual([]);
  });
  it('mapCalendarEditions sorts league first', () => {
    const cal = { competitions: [{ id: 'e2', competition: { name: 'Kup', isLeague: false } }, { id: 'e1', competition: { name: 'Liga', isLeague: true } }] };
    const eds = mapCalendarEditions(cal);
    expect(eds[0].isLeague).toBe(true);
    expect(eds[0].id).toBe('e1');
    expect(mapCalendarEditions({})).toEqual([]);
  });
  it('pickDefaultEditionId selected and fallback', () => {
    const eds = [{ id: 'e1', isLeague: false }, { id: 'e2', isLeague: true }];
    expect(pickDefaultEditionId(eds, 'e1')).toBe('e1');
    expect(pickDefaultEditionId(eds, 'unknown')).toBe('e2');
    expect(pickDefaultEditionId(eds)).toBe('e2');
    expect(pickDefaultEditionId([])).toBe('');
  });
  it('pickDefaultLeagueSeasonId active', () => {
    const ss = [{ id: 's1', isActive: false }, { id: 's2', isActive: true }];
    expect(pickDefaultLeagueSeasonId(ss)).toBe('s2');
    expect(pickDefaultLeagueSeasonId(ss, 's1')).toBe('s1');
    expect(pickDefaultLeagueSeasonId([])).toBe('');
  });
  it('matchStatusKey known and fallback', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('HALFTIME')).toBe('matchHalftime');
    expect(matchStatusKey('UNKNOWN')).toBe('matchScheduled');
    expect(matchStatusKey('')).toBe('matchScheduled');
  });
  it('matchMetaLine competition round', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Premijer' } }, roundRel: { number: 5, name: 'Kolo 5' } }, (n) => `Kolo ${n}`)).toBe('Premijer · Kolo 5');
    expect(matchMetaLine({ roundRel: { number: 0, name: 'Custom' } }, (n) => `Kolo ${n}`)).toBe('Custom');
  });
  it('matchMetaLine missing', () => {
    expect(matchMetaLine({}, (n) => `Kolo ${n}`)).toBe('');
    expect(matchMetaLine({ season: { competition: { name: 'Liga' } } }, (n) => `Kolo ${n}`)).toBe('Liga');
  });
});
