import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { flattenSeasonEditions } from './flatten-editions';
import { mapCalendarEditions, mapCalendarSeasons, pickDefaultLeagueSeasonId } from './league-season';
import { matchEventLabelKey } from './match-events';
import { matchMetaLine, matchStatusKey } from './match-status';
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from './ticketing-status';

describe('mob-batch241 — P-MOB154 desk/flatten/league/ticketing/match (test-only)', () => {
  it('deskCounts', () => {
    expect(deskCounts([{ status: 'LIVE' }, { status: 'HALFTIME' }, { status: 'SCHEDULED' }, { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' }])).toEqual({ live: 2, scheduled: 1, reports: 1 });
    expect(deskCounts([])).toEqual({ live: 0, scheduled: 0, reports: 0 });
  });
  it('filterCommentatorDesk', () => {
    const today = new Date().toISOString();
    expect(filterCommentatorDesk([{ status: 'LIVE' }, { status: 'SCHEDULED', scheduledAt: today }] as any).length).toBe(2);
    expect(filterCommentatorDesk([{ status: 'SCHEDULED', scheduledAt: '2000-01-01' } as any])).toEqual([]);
  });
  it('flattenSeasonEditions', () => {
    expect(flattenSeasonEditions([{ id: 'c1', name: '2023', competitions: [{ id: 'e1', competition: { name: 'Liga' } }] }])[0].id).toBe('e1');
    expect(flattenSeasonEditions(null)).toEqual([]);
  });
  it('flattenSeasonEditions fallback', () => {
    expect(flattenSeasonEditions([{ id: 'c', competitions: [{ id: 'e', competition: {} }] }])[0].name).toBe('Takmičenje · Sezona');
    expect(flattenSeasonEditions([{ id: 'c', competitions: [{ id: '', competition: { name: 'X' } }] }])).toEqual([]);
  });
  it('ticketing', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('x')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('EXPIRED')).toBe(false);
  });
  it('canPayOrderOnline', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }] })).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID' }] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] })).toBe(false);
  });
  it('canCancelOrder', () => {
    expect(canCancelOrder({ status: 'pending' })).toBe(true);
    expect(canCancelOrder({ status: 'done' })).toBe(false);
  });
  it('mapCalendarSeasons', () => {
    expect(mapCalendarSeasons([{ id: 's1', name: '2024', isActive: true }]).length).toBe(1);
    expect(mapCalendarSeasons([{ id: '' }])).toEqual([]);
    expect(mapCalendarSeasons(null)).toEqual([]);
  });
  it('mapCalendarEditions', () => {
    const cal = { competitions: [{ id: 'e1', competition: { name: 'Liga', isLeague: true } }, { id: 'e2', competition: { name: 'Kup', isLeague: false } }] };
    expect(mapCalendarEditions(cal)[0].isLeague).toBe(true);
    expect(mapCalendarEditions({ competitions: [] } as any)).toEqual([]);
  });
  it('pickDefaultLeagueSeasonId', () => {
    const ss = [{ id: 's1', isActive: false }, { id: 's2', isActive: true }];
    expect(pickDefaultLeagueSeasonId(ss)).toBe('s2');
    expect(pickDefaultLeagueSeasonId(ss, 's1')).toBe('s1');
    expect(pickDefaultLeagueSeasonId([])).toBe('');
  });
  it('matchStatusKey', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('HALFTIME')).toBe('matchHalftime');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished');
    expect(matchStatusKey('bad')).toBe('matchScheduled');
  });
  it('matchMetaLine', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Premijer' } }, roundRel: { number: 5, name: 'Kolo 5' } }, (n) => `Kolo ${n}`)).toBe('Premijer · Kolo 5');
    expect(matchMetaLine({ roundRel: { number: 0, name: 'Derbi' } }, (n) => `Kolo ${n}`)).toBe('Derbi');
    expect(matchMetaLine({}, (n) => `Kolo ${n}`)).toBe('');
  });
  it('matchEventLabelKey', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
  });
  it('matchEventLabelKey subs', () => {
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
    expect(matchEventLabelKey('')).toBe('eventOther');
  });
  it('fallback', () => {
    expect(mapCalendarSeasons([{ name: 'no' }])).toEqual([]);
    expect(mapCalendarEditions({ competitions: [{ competition: { name: 'X' } }] } as any)).toEqual([]);
  });
});
