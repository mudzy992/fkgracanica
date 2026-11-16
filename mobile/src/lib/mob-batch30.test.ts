import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from '../lib/desk-counts';
import { matchMetaLine, matchStatusKey } from '../lib/match-status';
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from '../lib/ticketing-status';
import { matchEventLabelKey } from '../lib/match-events';

describe('mob-batch30 — P-MOB30 desk + status + ticketing + events', () => {
  it('deskCounts broji live/scheduled/reports', () => {
    const matches = [
      { status: 'LIVE' },
      { status: 'HALFTIME' },
      { status: 'SCHEDULED' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
      { status: 'FINISHED', reportStatus: 'APPROVED' },
      { status: 'FINISHED' },
    ];
    const c = deskCounts(matches);
    expect(c.live).toBe(2);
    expect(c.scheduled).toBe(1);
    expect(c.reports).toBe(1);
  });

  it('filterCommentatorDesk filtrira live/today/report', () => {
    const nowIso = new Date().toISOString();
    const matches = [
      { status: 'LIVE', id: '1' },
      { status: 'SCHEDULED', scheduledAt: nowIso, id: '2' },
      { status: 'SCHEDULED', scheduledAt: '2020-01-01T00:00:00Z', id: '3' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL', id: '4' },
      { status: 'FINISHED', reportStatus: 'APPROVED', id: '5' },
    ] as never[];
    const filtered = filterCommentatorDesk(matches);
    expect(filtered.map((m) => m.id)).toEqual(['1', '2', '4']);
  });

  it('matchStatusKey mapira', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('HALFTIME')).toBe('matchHalftime');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished');
    expect(matchStatusKey('SCHEDULED')).toBe('matchScheduled');
    expect(matchStatusKey('POSTPONED')).toBe('matchPostponed');
    expect(matchStatusKey('CANCELLED')).toBe('matchCancelled');
    expect(matchStatusKey('nepoznato')).toBe('matchScheduled');
  });

  it('matchMetaLine kombinuje', () => {
    const m1 = { season: { competition: { name: 'Liga' } }, roundRel: { number: 5 } } as never;
    expect(matchMetaLine(m1, (n) => `${n}. kolo`)).toBe('Liga · 5. kolo');
    const m2 = { season: null, roundRel: { name: 'Finale' } } as never;
    expect(matchMetaLine(m2, (n) => `${n}. kolo`)).toBe('Finale');
    const m3 = { season: null, roundRel: null } as never;
    expect(matchMetaLine(m3, (n) => `${n}.`)).toBe('');
    const m4 = { season: { competition: { name: 'Kup' } }, roundRel: { number: 0, name: 'Četvrtfinale' } } as never;
    expect(matchMetaLine(m4, (n) => `${n}.`)).toBe('Kup · Četvrtfinale');
  });

  it('canShowTicketQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('RESERVED')).toBe(false);
    expect(canShowTicketQr('PAID_ONLINE')).toBe(false);
  });

  it('canPayOrderOnline', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'RESERVED' }] })).toBe(true);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'USED' }] })).toBe(false);
  });

  it('canCancelOrder', () => {
    expect(canCancelOrder({ status: 'pending' })).toBe(true);
    expect(canCancelOrder({ status: 'paid' })).toBe(false);
    expect(canCancelOrder({ status: 'cancelled' })).toBe(false);
  });

  it('canShowSeasonQr', () => {
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('PENDING')).toBe(false);
  });

  it('matchEventLabelKey mapira', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
    expect(matchEventLabelKey('nepoznato')).toBe('eventOther');
  });

  it('filterCommentatorDesk prazno', () => {
    expect(filterCommentatorDesk([])).toEqual([]);
  });

  it('deskCounts prazno', () => {
    expect(deskCounts([])).toEqual({ live: 0, scheduled: 0, reports: 0 });
  });
});
