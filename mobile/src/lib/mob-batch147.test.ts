import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { flattenSeasonEditions } from './flatten-editions';
import { mapCalendarEditions, mapCalendarSeasons, pickDefaultEditionId } from './league-season';
import { matchEventLabelKey } from './match-events';
import { matchMetaLine, matchStatusKey } from './match-status';
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from './ticketing-status';

describe('mob-batch147 — P-MOB60 desk/flatten/league/ticketing/match (test-only)', () => {
  it('deskCounts', () => {
    expect(deskCounts([{ status: 'LIVE' }, { status: 'SCHEDULED' }, { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' }])).toEqual({ live: 1, scheduled: 1, reports: 1 });
    expect(deskCounts([])).toEqual({ live: 0, scheduled: 0, reports: 0 });
    expect(deskCounts([{ status: 'HALFTIME' }, { status: 'FINISHED', reportStatus: 'APPROVED' }])).toEqual({ live: 1, scheduled: 0, reports: 0 });
  });
  it('filterCommentatorDesk today/live/report', () => {
    const today = new Date().toISOString();
    const res = filterCommentatorDesk([{ status: 'LIVE' }, { status: 'SCHEDULED', scheduledAt: today }, { status: 'SCHEDULED', scheduledAt: '1999-01-01T00:00:00Z' }, { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' }] as any);
    expect(res.length).toBe(3);
    expect(filterCommentatorDesk([])).toEqual([]);
  });
  it('flattenSeasonEditions', () => {
    const data = [{ id: 'c1', name: 'Sezona', competitions: [{ id: 'e1', competition: { name: 'Liga' } }] }];
    expect(flattenSeasonEditions(data)[0].id).toBe('e1');
    expect(flattenSeasonEditions(data)[0].name).toContain('Liga');
    expect(flattenSeasonEditions([])).toEqual([]);
    expect(flattenSeasonEditions(null)).toEqual([]);
  });
  it('flattenSeasonEditions defaults', () => {
    const res = flattenSeasonEditions([{ id: 'c', competitions: [{ id: 'e', competition: {} }] }]);
    expect(res[0].name).toBe('Takmičenje · Sezona');
    const res2 = flattenSeasonEditions([{ id: 'c', name: '2024', competitions: [{ id: '', competition: { name: 'X' } }] }]);
    expect(res2).toEqual([]);
  });
  it('canShowTicketQr and canShowSeasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('RESERVED')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('INACTIVE')).toBe(false);
  });
  it('canPayOrderOnline', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }] })).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID_AT_BOX_OFFICE' }] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] })).toBe(false);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] })).toBe(false);
  });
  it('canCancelOrder', () => {
    expect(canCancelOrder({ status: 'pending' })).toBe(true);
    expect(canCancelOrder({ status: 'expired' })).toBe(false);
    expect(canCancelOrder({ status: '' })).toBe(false);
  });
  it('mapCalendarSeasons', () => {
    expect(mapCalendarSeasons([{ id: 's1', name: '2023', isActive: true }])).toEqual([{ id: 's1', name: '2023', isActive: true }]);
    expect(mapCalendarSeasons([{ id: '', name: 'x' }])).toEqual([]);
    expect(mapCalendarSeasons(null)).toEqual([]);
  });
  it('mapCalendarEditions sorting', () => {
    const cal = { competitions: [{ id: 'e2', competition: { name: 'Kup', isLeague: false } }, { id: 'e1', competition: { name: 'Liga', isLeague: true } }] };
    const eds = mapCalendarEditions(cal);
    expect(eds[0].id).toBe('e1');
    expect(eds[0].isLeague).toBe(true);
    expect(mapCalendarEditions({})).toEqual([]);
  });
  it('pickDefaultEditionId', () => {
    const eds = [{ id: 'e1', isLeague: false }, { id: 'e2', isLeague: true }];
    expect(pickDefaultEditionId(eds, 'e1')).toBe('e1');
    expect(pickDefaultEditionId(eds)).toBe('e2');
    expect(pickDefaultEditionId([])).toBe('');
    expect(pickDefaultEditionId(eds, 'unknown')).toBe('e2');
  });
  it('matchStatusKey', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('POSTPONED')).toBe('matchPostponed');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished');
    expect(matchStatusKey('blah')).toBe('matchScheduled');
  });
  it('matchMetaLine', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Premijer' } }, roundRel: { number: 2, name: 'Kolo 2' } }, (n) => `Kolo ${n}`)).toBe('Premijer · Kolo 2');
    expect(matchMetaLine({ roundRel: { number: 0, name: 'Custom' } }, (n) => `Kolo ${n}`)).toBe('Custom');
    expect(matchMetaLine({}, (n) => `Kolo ${n}`)).toBe('');
  });
  it('matchEventLabelKey', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
    expect(matchEventLabelKey('')).toBe('eventOther');
  });
  it('matchEventLabelKey all', () => {
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
  });
  it('combined league fallback', () => {
    expect(mapCalendarSeasons([{ name: 'no id' }])).toEqual([]);
    expect(mapCalendarEditions({ competitions: [{ competition: { name: 'X' } }] } as any)).toEqual([]);
  });
});
