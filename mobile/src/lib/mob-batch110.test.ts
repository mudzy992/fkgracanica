import { describe, expect, it, vi } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { flattenSeasonEditions } from './flatten-editions';
import { kpiLabel, KPI_LABELS } from './dashboard-kpi-labels';
import { computeLiveClock, formatLiveMinute } from './live-clock';
import { matchEventLabelKey } from './match-events';

describe('mob-batch110 — P-MOB23 desk/kpi/flatten/live (test-only)', () => {
  it('deskCounts live scheduled reports', () => {
    const matches = [
      { status: 'LIVE' },
      { status: 'HALFTIME' },
      { status: 'SCHEDULED' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
      { status: 'FINISHED', reportStatus: 'APPROVED' },
      { status: 'SCHEDULED' },
    ];
    const c = deskCounts(matches);
    expect(c.live).toBe(2);
    expect(c.scheduled).toBe(2);
    expect(c.reports).toBe(1);
  });
  it('deskCounts empty', () => {
    expect(deskCounts([])).toEqual({ live: 0, scheduled: 0, reports: 0 });
  });
  it('filterCommentatorDesk filters live today report', () => {
    const nowIso = new Date().toISOString();
    const matches = [
      { status: 'LIVE', scheduledAt: nowIso },
      { status: 'SCHEDULED', scheduledAt: nowIso },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
      { status: 'SCHEDULED', scheduledAt: '2000-01-01T00:00:00Z' },
      { status: 'FINISHED', reportStatus: 'APPROVED' },
    ] as any;
    const filtered = filterCommentatorDesk(matches);
    expect(filtered.length).toBe(3);
    expect(filtered.some((m) => m.status === 'LIVE')).toBe(true);
  });
  it('flattenSeasonEditions maps competitions', () => {
    const data = [
      { id: 'cal1', name: '2024/25', competitions: [{ id: 'ed1', competition: { name: 'Premijer' } }, { id: 'ed2', competition: { name: 'Kup' } }] },
    ];
    const out = flattenSeasonEditions(data);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ id: 'ed1', calendarId: 'cal1', calendarName: '2024/25', name: 'Premijer · 2024/25' });
  });
  it('flattenSeasonEditions fallback Sezona and Takmičenje', () => {
    const data = [{ id: 'c1', competitions: [{ id: 'e1', competition: {} }] }] as any;
    const out = flattenSeasonEditions(data);
    expect(out[0].calendarName).toBe('Sezona');
    expect(out[0].name).toBe('Takmičenje · Sezona');
  });
  it('flattenSeasonEditions filters empty id', () => {
    const data = [{ id: 'c1', name: 'Cal', competitions: [{ competition: { name: 'X' } }, { id: '', competition: { name: 'Y' } }] }] as any;
    expect(flattenSeasonEditions(data)).toEqual([]);
  });
  it('flattenSeasonEditions empty input', () => {
    expect(flattenSeasonEditions(null)).toEqual([]);
    expect(flattenSeasonEditions([])).toEqual([]);
  });
  it('kpiLabel known and fallback', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('matches')).toBe('Utakmice');
    expect(kpiLabel('unknownKey')).toBe('unknownKey');
    expect(KPI_LABELS['pendingLive']).toBe('Live izvještaji');
  });
  it('computeLiveClock null for non-live or missing', () => {
    expect(computeLiveClock({ status: 'SCHEDULED', clockStartedAt: new Date().toISOString(), matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: null, matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: new Date().toISOString(), matchPeriod: 'UNKNOWN' })).toBeNull();
  });
  it('computeLiveClock first half elapsed', () => {
    const start = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const clock = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF' }, Date.now());
    expect(clock?.displayMinute).toBe(10);
    expect(clock?.periodLabel).toBe('1. poluvrijeme');
    expect(clock?.displaySecond).toBeGreaterThanOrEqual(0);
  });
  it('computeLiveClock second half offset', () => {
    const start = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const clock = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'SECOND_HALF' }, Date.now());
    // start 46 + 5 -1 = 50
    expect(clock?.displayMinute).toBe(50);
    expect(clock?.periodLabel).toBe('2. poluvrijeme');
  });
  it('computeLiveClock showStoppage', () => {
    const start = new Date(Date.now() - 50 * 60 * 1000).toISOString();
    const clock = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF', stoppageFirstHalf: 3 }, Date.now());
    expect(clock?.showStoppage).toBe(true);
    expect(clock?.stoppage).toBe(3);
    const noStop = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF', stoppageFirstHalf: 0 }, Date.now());
    expect(noStop?.showStoppage).toBe(false);
  });
  it('formatLiveMinute fallback and stoppage', () => {
    expect(formatLiveMinute(null, 0)).toBe("0'");
    expect(formatLiveMinute(null, 5)).toBe("5'");
    expect(formatLiveMinute({ displayMinute: 45, displaySecond: 5, periodLabel: '1. poluvrijeme', showStoppage: false, stoppage: 0 } as any)).toBe('45:05');
    expect(formatLiveMinute({ displayMinute: 47, displaySecond: 0, periodLabel: '1. poluvrijeme', showStoppage: true, stoppage: 2 } as any)).toBe('47:00 (+2)');
  });
  it('matchEventLabelKey maps all', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
    expect(matchEventLabelKey('HALFTIME')).toBe('eventHalftime');
    expect(matchEventLabelKey('FULL_TIME')).toBe('eventFullTime');
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
  });
  it('kpiLabel covers all defined keys', () => {
    expect(kpiLabel('uniqueVisitorsWeb')).toBe('Posjetioci web (30d)');
    expect(kpiLabel('uniqueVisitorsMobile')).toBe('Posjetioci mobile (30d)');
    expect(kpiLabel('goals')).toBe('Golovi');
  });
});
