import { describe, expect, it } from 'vitest';
import { deskCounts } from './desk-counts';
import { kpiLabel } from './dashboard-kpi-labels';
import { flattenSeasonEditions } from './flatten-editions';
import { computeLiveClock } from './live-clock';
import { matchEventLabelKey } from './match-events';

describe('mob-batch101 — P-MOB14 desk/kpi/flatten/live (test-only)', () => {
  it('deskCounts live/scheduled/reports', () => {
    expect(deskCounts([{status:'LIVE'} as any])).toEqual({live:1,scheduled:0,reports:0});
    expect(deskCounts([])).toEqual({live:0,scheduled:0,reports:0});
  });
  it('kpiLabel known', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('unknown')).toBe('unknown');
  });
  it('flattenSeasonEditions empty', () => {
    expect(flattenSeasonEditions(null)).toEqual([]);
    expect(flattenSeasonEditions([])).toEqual([]);
  });
  it('flattenSeasonEditions maps', () => {
    const d = [{id:'c1',name:'S',competitions:[{id:'e1',competition:{name:'Liga'}}]}];
    expect(flattenSeasonEditions(d)[0].name).toContain('Liga');
  });
  it('computeLiveClock null cases', () => {
    expect(computeLiveClock({status:'FINISHED'} as any)).toBeNull();
    expect(computeLiveClock({status:'LIVE'} as any)).toBeNull();
  });
  it('computeLiveClock first half', () => {
    const start = new Date(Date.now()-60000).toISOString();
    const c = computeLiveClock({status:'LIVE',clockStartedAt:start,matchPeriod:'FIRST_HALF'} as any);
    expect(c).not.toBeNull();
  });
  it('matchEventLabelKey', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
  });
  it('deskCounts scheduled', () => {
    expect(deskCounts([{status:'SCHEDULED'} as any]).scheduled).toBe(1);
  });
  it('kpiLabel pending', () => {
    expect(kpiLabel('pendingNews')).toBe('Vijesti na odobrenju');
  });
  it('flattenSeasonEditions filter', () => {
    expect(flattenSeasonEditions([{id:'c1',competitions:[{competition:{name:'X'}}]}])).toEqual([]);
  });
  it('computeLiveClock second half', () => {
    const start = new Date(Date.now()-60000).toISOString();
    const c = computeLiveClock({status:'LIVE',clockStartedAt:start,matchPeriod:'SECOND_HALF'} as any);
    expect(c!.periodLabel).toBe('2. poluvrijeme');
  });
  it('matchEventLabelKey YELLOW', () => {
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
  });
  it('deskCounts reports', () => {
    expect(deskCounts([{status:'FINISHED',reportStatus:'PENDING_APPROVAL'} as any]).reports).toBe(1);
  });
  it('kpiLabel total', () => {
    expect(kpiLabel('uniqueVisitorsTotal30d')).toBe('Ukupni posjetioci (30d)');
  });
  it('flattenSeasonEditions calendarName fallback', () => {
    expect(flattenSeasonEditions([{id:'c1',competitions:[{id:'e1',competition:{name:'Liga'}}]}])[0].calendarName).toBe('Sezona');
  });
});
