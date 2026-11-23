import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { flattenSeasonEditions } from './flatten-editions';
import { mapCalendarEditions, mapCalendarSeasons, pickDefaultEditionId } from './league-season';
import { matchMetaLine, matchStatusKey } from './match-status';
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from './ticketing-status';
import { matchEventLabelKey } from './match-events';

describe('mob-batch153 — P-MOB66 desk/flatten/league/ticketing/match (test-only)', () => {
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
    const data = [{ id: 'c1', name: '2023', competitions: [{ id: 'e1', competition: { name: 'Liga' } }] }];
    expect(flattenSeasonEditions(data)[0].id).toBe('e1');
    expect(flattenSeasonEditions(null)).toEqual([]);
    expect(flattenSeasonEditions([])).toEqual([]);
  });
  it('flattenSeasonEditions empty id', () => {
    expect(flattenSeasonEditions([{ id: 'c', competitions: [{ id: '', competition: { name: 'X' } }] }])).toEqual([]);
    expect(flattenSeasonEditions([{ id: 'c', competitions: [{ id: 'e', competition: {} }] }])[0].name).toBe('Takmičenje · Sezona');
  });
  it('canShowTicketQr canShowSeasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('pending')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('EXPIRED')).toBe(false);
  });
  it('canPayOrderOnline', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }] })).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID_AT_BOX_OFFICE' }] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] })).toBe(false);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] })).toBe(false);
  });
  it('canCancelOrder', () => {
    expect(canCancelOrder({ status: 'pending' })).toBe(true);
    expect(canCancelOrder({ status: 'paid' })).toBe(false);
  });
  it('mapCalendarSeasons', () => {
    expect(mapCalendarSeasons([{ id: 's1', name: '2023', isActive: true }])).toEqual([{ id: 's1', name: '2023', isActive: true }]);
    expect(mapCalendarSeasons([{ id: '' }])).toEqual([]);
    expect(mapCalendarSeasons(null)).toEqual([]);
  });
  it('mapCalendarEditions', () => {
    const cal = { competitions: [{ id: 'e2', competition: { name: 'Kup', isLeague: false } }, { id: 'e1', competition: { name: 'Liga', isLeague: true } }] };
    const eds = mapCalendarEditions(cal);
    expect(eds[0].id).toBe('e1');
    expect(eds[0].isLeague).toBe(true);
  });
  it('pickDefaultEditionId', () => {
    const eds = [{ id: 'e1', isLeague: false }, { id: 'e2', isLeague: true }];
    expect(pickDefaultEditionId(eds, 'e1')).toBe('e1');
    expect(pickDefaultEditionId(eds)).toBe('e2');
    expect(pickDefaultEditionId([])).toBe('');
  });
  it('matchStatusKey', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished');
    expect(matchStatusKey('unknown')).toBe('matchScheduled');
    expect(matchStatusKey('POSTPONED')).toBe('matchPostponed');
  });
  it('matchMetaLine', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Premijer' } }, roundRel: { number: 5, name: 'Kolo 5' } }, (n) => `Kolo ${n}`)).toBe('Premijer · Kolo 5');
    expect(matchMetaLine({ roundRel: { number: 0, name: 'Derbi' } }, (n) => `Kolo ${n}`)).toBe('Derbi');
    expect(matchMetaLine({}, (n) => `Kolo ${n}`)).toBe('');
  });
  it('matchEventLabelKey', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
  });
  it('matchEventLabelKey others', () => {
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
  });
  it('combined fallback', () => {
    expect(mapCalendarSeasons([{ name: 'no' }])).toEqual([]);
    expect(mapCalendarEditions({ competitions: [{ competition: { name: 'X' } }] } as any)).toEqual([]);
  });
});
