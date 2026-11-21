import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { flattenSeasonEditions } from './flatten-editions';
import { kpiLabel, KPI_LABELS } from './dashboard-kpi-labels';
import { computeLiveClock, formatLiveMinute } from './live-clock';
import { matchEventLabelKey } from './match-events';

describe('mob-batch119 — P-MOB32 desk/kpi/flatten/live (test-only)', () => {
  it('deskCounts live scheduled reports', () => {
    const matches = [
      { status: 'LIVE' },
      { status: 'HALFTIME' },
      { status: 'SCHEDULED' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
      { status: 'FINISHED', reportStatus: 'APPROVED' },
    ] as any;
    const c = deskCounts(matches);
    expect(c.live).toBe(2);
    expect(c.scheduled).toBe(1);
    expect(c.reports).toBe(1);
  });
  it('deskCounts empty', () => {
    expect(deskCounts([])).toEqual({ live: 0, scheduled: 0, reports: 0 });
  });
  it('filterCommentatorDesk live today report', () => {
    const nowIso = new Date().toISOString();
    const matches = [
      { status: 'LIVE' },
      { status: 'SCHEDULED', scheduledAt: nowIso },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
      { status: 'SCHEDULED', scheduledAt: '2000-01-01T00:00:00Z' },
    ] as any;
    const f = filterCommentatorDesk(matches);
    expect(f.length).toBe(3);
  });
  it('flattenSeasonEditions maps', () => {
    const data = [{ id: 'cal1', name: '2024/25', competitions: [{ id: 'ed1', competition: { name: 'Premijer' } }] }] as any;
    const out = flattenSeasonEditions(data);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ id: 'ed1', calendarId: 'cal1', calendarName: '2024/25', name: 'Premijer · 2024/25' });
  });
  it('flattenSeasonEditions fallback Sezona Takmičenje', () => {
    const data = [{ id: 'c1', competitions: [{ id: 'e1', competition: {} }] }] as any;
    const out = flattenSeasonEditions(data);
    expect(out[0].calendarName).toBe('Sezona');
    expect(out[0].name).toBe('Takmičenje · Sezona');
  });
  it('flattenSeasonEditions filters empty id', () => {
    const data = [{ id: 'c1', name: 'Cal', competitions: [{ competition: { name: 'X' } }] }] as any;
    expect(flattenSeasonEditions(data)).toEqual([]);
  });
  it('flattenSeasonEditions empty', () => {
    expect(flattenSeasonEditions(null)).toEqual([]);
    expect(flattenSeasonEditions([])).toEqual([]);
  });
  it('kpiLabel known fallback', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('matches')).toBe('Utakmice');
    expect(kpiLabel('unknown')).toBe('unknown');
    expect(KPI_LABELS['pendingLive']).toBe('Live izvještaji');
  });
  it('computeLiveClock null cases', () => {
    expect(computeLiveClock({ status: 'SCHEDULED', clockStartedAt: new Date().toISOString(), matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: null, matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: new Date().toISOString(), matchPeriod: 'BAD' })).toBeNull();
  });
  it('computeLiveClock first half', () => {
    const start = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const clock = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF' }, Date.now());
    expect(clock?.displayMinute).toBe(10);
    expect(clock?.periodLabel).toBe('1. poluvrijeme');
  });
  it('computeLiveClock second half offset', () => {
    const start = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const clock = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'SECOND_HALF' }, Date.now());
    expect(clock?.displayMinute).toBe(50);
    expect(clock?.periodLabel).toBe('2. poluvrijeme');
  });
  it('computeLiveClock stoppage', () => {
    const start = new Date(Date.now() - 50 * 60 * 1000).toISOString();
    const clock = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF', stoppageFirstHalf: 4 }, Date.now());
    expect(clock?.showStoppage).toBe(true);
    expect(clock?.stoppage).toBe(4);
  });
  it('formatLiveMinute', () => {
    expect(formatLiveMinute(null, 0)).toBe("0'");
    expect(formatLiveMinute({ displayMinute: 45, displaySecond: 5, periodLabel: '1. poluvrijeme', showStoppage: false, stoppage: 0 } as any)).toBe('45:05');
    expect(formatLiveMinute({ displayMinute: 47, displaySecond: 0, periodLabel: '1. poluvrijeme', showStoppage: true, stoppage: 2 } as any)).toBe('47:00 (+2)');
  });
  it('matchEventLabelKey all', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
    expect(matchEventLabelKey('HALFTIME')).toBe('eventHalftime');
    expect(matchEventLabelKey('FULL_TIME')).toBe('eventFullTime');
    expect(matchEventLabelKey('OTHER')).toBe('eventOther');
  });
  it('kpiLabel additional', () => {
    expect(kpiLabel('uniqueVisitorsWeb')).toBe('Posjetioci web (30d)');
    expect(kpiLabel('uniqueVisitorsMobile')).toBe('Posjetioci mobile (30d)');
  });
});
