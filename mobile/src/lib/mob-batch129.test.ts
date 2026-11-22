import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { flattenSeasonEditions } from './flatten-editions';
import { KPI_LABELS, kpiLabel } from './dashboard-kpi-labels';
import { computeLiveClock, formatLiveMinute } from './live-clock';
import { matchEventLabelKey } from './match-events';

describe('mob-batch129 — P-MOB42 desk/kpi/flatten/live (test-only)', () => {
  it('deskCounts counts live/halftime scheduled reports', () => {
    const matches = [
      { status: 'LIVE' },
      { status: 'HALFTIME' },
      { status: 'SCHEDULED' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
      { status: 'FINISHED', reportStatus: 'APPROVED' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
    ] as any;
    const c = deskCounts(matches);
    expect(c.live).toBe(2);
    expect(c.scheduled).toBe(1);
    expect(c.reports).toBe(2);
  });
  it('deskCounts empty and no matches', () => {
    expect(deskCounts([])).toEqual({ live: 0, scheduled: 0, reports: 0 });
    expect(deskCounts([{ status: 'CANCELLED' } as any])).toEqual({ live: 0, scheduled: 0, reports: 0 });
  });
  it('filterCommentatorDesk filters live today report', () => {
    const nowIso = new Date().toISOString();
    const matches = [
      { status: 'LIVE' },
      { status: 'HALFTIME' },
      { status: 'SCHEDULED', scheduledAt: nowIso },
      { status: 'SCHEDULED', scheduledAt: '2000-01-01T00:00:00Z' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
      { status: 'FINISHED', reportStatus: 'APPROVED' },
    ] as any;
    const f = filterCommentatorDesk(matches);
    expect(f.length).toBe(4);
    expect(f.some((m) => m.status === 'LIVE')).toBe(true);
    expect(f.some((m) => m.scheduledAt === nowIso)).toBe(true);
  });
  it('flattenSeasonEditions maps with competition name', () => {
    const data = [{ id: 'cal1', name: '2024/25', competitions: [{ id: 'ed1', competition: { name: 'Premijer' } }] }] as any;
    const out = flattenSeasonEditions(data);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ id: 'ed1', calendarId: 'cal1', calendarName: '2024/25', name: 'Premijer · 2024/25' });
  });
  it('flattenSeasonEditions fallback defaults', () => {
    const data = [{ id: 'c1', competitions: [{ id: 'e1', competition: {} }] }] as any;
    const out = flattenSeasonEditions(data);
    expect(out[0].calendarName).toBe('Sezona');
    expect(out[0].name).toBe('Takmičenje · Sezona');
    expect(flattenSeasonEditions([{ id: 'c1', name: 'Cal', competitions: [{ competition: { name: 'X' } }] }] as any)).toEqual([]);
  });
  it('flattenSeasonEditions empty null', () => {
    expect(flattenSeasonEditions(null)).toEqual([]);
    expect(flattenSeasonEditions([])).toEqual([]);
    expect(flattenSeasonEditions(undefined)).toEqual([]);
  });
  it('kpiLabel known and fallback', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('members')).toBe('Članovi');
    expect(kpiLabel('matches')).toBe('Utakmice');
    expect(kpiLabel('unknownKey')).toBe('unknownKey');
    expect(KPI_LABELS['pendingLive']).toBe('Live izvještaji');
  });
  it('kpiLabel additional keys', () => {
    expect(kpiLabel('uniqueVisitorsWeb')).toBe('Posjetioci web (30d)');
    expect(kpiLabel('uniqueVisitorsMobile')).toBe('Posjetioci mobile (30d)');
    expect(kpiLabel('uniqueVisitorsTotal30d')).toBe('Ukupni posjetioci (30d)');
    expect(kpiLabel('publishedNews')).toBe('Objavljene vijesti');
  });
  it('computeLiveClock null for non-live or missing', () => {
    expect(computeLiveClock({ status: 'SCHEDULED', clockStartedAt: new Date().toISOString(), matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: null, matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: new Date().toISOString(), matchPeriod: 'BAD' as any })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: new Date().toISOString(), matchPeriod: null } as any)).toBeNull();
  });
  it('computeLiveClock first half elapsed', () => {
    const start = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const clock = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF' }, Date.now());
    expect(clock?.displayMinute).toBe(10);
    expect(clock?.periodLabel).toBe('1. poluvrijeme');
    expect(clock?.displaySecond).toBeGreaterThanOrEqual(0);
  });
  it('computeLiveClock second half offset 46 start', () => {
    const start = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const clock = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'SECOND_HALF' }, Date.now());
    expect(clock?.displayMinute).toBe(50);
    expect(clock?.periodLabel).toBe('2. poluvrijeme');
  });
  it('computeLiveClock extra periods', () => {
    const start = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const c1 = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'EXTRA_FIRST' }, Date.now());
    expect(c1?.periodLabel).toBe('1. produžetak');
    expect(c1?.displayMinute).toBe(92);
    const c2 = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'EXTRA_SECOND' }, Date.now());
    expect(c2?.periodLabel).toBe('2. produžetak');
  });
  it('computeLiveClock stoppage shown only over end', () => {
    const start = new Date(Date.now() - 50 * 60 * 1000).toISOString();
    const clock = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF', stoppageFirstHalf: 4 }, Date.now());
    expect(clock?.showStoppage).toBe(true);
    expect(clock?.stoppage).toBe(4);
    const noStop = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF', stoppageFirstHalf: 0 }, Date.now());
    expect(noStop?.showStoppage).toBe(false);
    const notOver = computeLiveClock({ status: 'LIVE', clockStartedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), matchPeriod: 'FIRST_HALF', stoppageFirstHalf: 4 }, Date.now());
    expect(notOver?.showStoppage).toBe(false);
  });
  it('formatLiveMinute fallback and with stoppage', () => {
    expect(formatLiveMinute(null, 0)).toBe("0'");
    expect(formatLiveMinute(null, 5)).toBe("5'");
    expect(formatLiveMinute({ displayMinute: 45, displaySecond: 5, periodLabel: 'x', showStoppage: false, stoppage: 0 } as any)).toBe('45:05');
    expect(formatLiveMinute({ displayMinute: 47, displaySecond: 0, periodLabel: 'x', showStoppage: true, stoppage: 2 } as any)).toBe('47:00 (+2)');
    expect(formatLiveMinute({ displayMinute: 90, displaySecond: 9, periodLabel: 'x', showStoppage: false, stoppage: 0 } as any)).toBe('90:09');
  });
  it('matchEventLabelKey all types', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
    expect(matchEventLabelKey('HALFTIME')).toBe('eventHalftime');
    expect(matchEventLabelKey('FULL_TIME')).toBe('eventFullTime');
    expect(matchEventLabelKey('OTHER')).toBe('eventOther');
    expect(matchEventLabelKey('')).toBe('eventOther');
  });
});
