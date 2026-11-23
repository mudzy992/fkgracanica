import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { flattenSeasonEditions } from './flatten-editions';
import { mapCalendarEditions, mapCalendarSeasons, pickDefaultLeagueSeasonId } from './league-season';
import { matchEventLabelKey } from './match-events';
import { matchMetaLine, matchStatusKey } from './match-status';
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from './ticketing-status';

describe('mob-batch149 — P-MOB62 desk/flatten/league/ticketing/match (test-only)', () => {
  it('deskCounts mixed', () => {
    expect(deskCounts([{ status: 'LIVE' }, { status: 'HALFTIME' }, { status: 'SCHEDULED' }])).toEqual({ live: 2, scheduled: 1, reports: 0 });
    expect(deskCounts([{ status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' }, { status: 'FINISHED', reportStatus: 'APPROVED' }])).toEqual({ live: 0, scheduled: 0, reports: 1 });
  });
  it('filterCommentatorDesk', () => {
    const today = new Date().toISOString();
    const res = filterCommentatorDesk([{ status: 'LIVE' }, { status: 'SCHEDULED', scheduledAt: today }, { status: 'SCHEDULED', scheduledAt: '2000-01-01' }, { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' }] as any);
    expect(res.length).toBe(3);
    expect(filterCommentatorDesk([{ status: 'FINISHED', reportStatus: 'APPROVED' }] as any)).toEqual([]);
  });
  it('flattenSeasonEditions basic', () => {
    const data = [{ id: 'c1', name: '2023', competitions: [{ id: 'e1', competition: { name: 'Liga' } }, { id: 'e2', competition: { name: 'Kup' } }] }];
    const res = flattenSeasonEditions(data);
    expect(res.length).toBe(2);
    expect(res[0].calendarId).toBe('c1');
    expect(flattenSeasonEditions(null)).toEqual([]);
  });
  it('flattenSeasonEditions filter empty id', () => {
    const res = flattenSeasonEditions([{ id: 'c', competitions: [{ id: '', competition: { name: 'X' } }, { id: 'e', competition: {} }] }]);
    expect(res.length).toBe(1);
    expect(res[0].name).toBe('Takmičenje · Sezona');
  });
  it('canShowTicketQr canShowSeasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('pending')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('EXPIRED')).toBe(false);
  });
  it('canPayOrderOnline reserved only', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'RESERVED' }] })).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID_AT_BOX_OFFICE' }] })).toBe(false);
  });
  it('canPayOrderOnline edge', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [] })).toBe(false);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] })).toBe(false);
  });
  it('canCancelOrder', () => {
    expect(canCancelOrder({ status: 'pending' })).toBe(true);
    expect(canCancelOrder({ status: 'cancelled' })).toBe(false);
  });
  it('mapCalendarSeasons', () => {
    const s = mapCalendarSeasons([{ id: 's1', name: '2024', isActive: false }, { id: 's2', name: '2025', isActive: true }]);
    expect(s.length).toBe(2);
    expect(s.find((x) => x.id === 's2')?.isActive).toBe(true);
    expect(mapCalendarSeasons([])).toEqual([]);
  });
  it('mapCalendarEditions', () => {
    const cal = { competitions: [{ id: 'e1', competition: { name: 'Liga', isLeague: true } }, { id: 'e2', competition: { name: 'Kup', isLeague: false } }] };
    const eds = mapCalendarEditions(cal);
    expect(eds[0].isLeague).toBe(true);
    expect(eds[1].name).toBe('Kup');
  });
  it('pickDefaultLeagueSeasonId', () => {
    const ss = [{ id: 's1', isActive: false }, { id: 's2', isActive: true }];
    expect(pickDefaultLeagueSeasonId(ss)).toBe('s2');
    expect(pickDefaultLeagueSeasonId(ss, 's1')).toBe('s1');
    expect(pickDefaultLeagueSeasonId([])).toBe('');
    expect(pickDefaultLeagueSeasonId(ss, 'unknown')).toBe('s2');
  });
  it('matchStatusKey', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('HALFTIME')).toBe('matchHalftime');
    expect(matchStatusKey('CANCELLED')).toBe('matchCancelled');
    expect(matchStatusKey('unknown')).toBe('matchScheduled');
  });
  it('matchMetaLine', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Premijer' } }, roundRel: { number: 5, name: 'Kolo 5' } }, (n) => `Kolo ${n}`)).toBe('Premijer · Kolo 5');
    expect(matchMetaLine({ roundRel: { number: 0, name: 'Derbi' } }, (n) => `Kolo ${n}`)).toBe('Derbi');
    expect(matchMetaLine({}, (n) => `Kolo ${n}`)).toBe('');
  });
  it('matchEventLabelKey', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
  });
  it('matchEventLabelKey fallback', () => {
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
    expect(matchEventLabelKey('')).toBe('eventOther');
  });
});
