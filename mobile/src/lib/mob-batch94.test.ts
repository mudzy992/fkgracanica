import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { flattenSeasonEditions } from './flatten-editions';
import { kpiLabel } from './dashboard-kpi-labels';
import { computeLiveClock, formatLiveMinute } from './live-clock';
import { matchEventLabelKey } from './match-events';

describe('mob-batch94 — P-MOB07 desk/flatten/kpi/live-clock/events (test-only)', () => {
  it('deskCounts counts live/scheduled/reports', () => {
    const ms = [{status:'LIVE'},{status:'HALFTIME'},{status:'SCHEDULED'},{status:'FINISHED',reportStatus:'PENDING_APPROVAL'},{status:'FINISHED'}];
    expect(deskCounts(ms as any)).toEqual({live:2,scheduled:1,reports:1});
    expect(deskCounts([])).toEqual({live:0,scheduled:0,reports:0});
  });
  it('filterCommentatorDesk keeps live, today scheduled, pending report', () => {
    const todayIso = new Date().toISOString();
    const tomorrow = new Date(Date.now()+86400000).toISOString();
    const ms = [
      {status:'LIVE', id:1},
      {status:'SCHEDULED', scheduledAt: todayIso, id:2},
      {status:'SCHEDULED', scheduledAt: tomorrow, id:3},
      {status:'FINISHED', reportStatus:'PENDING_APPROVAL', id:4},
      {status:'FINISHED', id:5},
    ] as any;
    const kept = filterCommentatorDesk(ms).map(m=>m.id);
    expect(kept).toEqual([1,2,4]);
  });
  it('flattenSeasonEditions maps calendars correctly', () => {
    const data = [{id:'c1',name:'2024/25',competitions:[{id:'e1',competition:{name:'Liga'}}]}];
    const eds = flattenSeasonEditions(data);
    expect(eds[0]).toEqual({id:'e1',calendarId:'c1',calendarName:'2024/25',name:'Liga · 2024/25'});
    expect(flattenSeasonEditions([{competitions:[{id:'e2'}]}])[0].calendarName).toBe('Sezona');
    expect(flattenSeasonEditions([])).toEqual([]);
    expect(flattenSeasonEditions(null)).toEqual([]);
  });
  it('flattenSeasonEditions filters without id', () => {
    expect(flattenSeasonEditions([{id:'c1',competitions:[{competition:{name:'X'}}]}])).toEqual([]);
  });
  it('kpiLabel returns known and fallback', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('matches')).toBe('Utakmice');
    expect(kpiLabel('unknownKey')).toBe('unknownKey');
  });
  it('kpiLabel all known keys defined', () => {
    expect(kpiLabel('uniqueVisitorsTotal30d')).toBe('Ukupni posjetioci (30d)');
  });
  it('computeLiveClock returns null for non-LIVE or missing data', () => {
    expect(computeLiveClock({status:'FINISHED',clockStartedAt:new Date().toISOString(),matchPeriod:'FIRST_HALF'})).toBeNull();
    expect(computeLiveClock({status:'LIVE',matchPeriod:'FIRST_HALF'})).toBeNull();
    expect(computeLiveClock({status:'LIVE',clockStartedAt:new Date().toISOString(),matchPeriod:'UNKNOWN' as any})).toBeNull();
  });
  it('computeLiveClock first half elapsed', () => {
    const start = new Date(Date.now()-5*60*1000).toISOString(); // 5 min ago
    const c = computeLiveClock({status:'LIVE',clockStartedAt:start,matchPeriod:'FIRST_HALF'}, Date.now());
    expect(c).not.toBeNull();
    expect(c!.periodLabel).toBe('1. poluvrijeme');
    expect(c!.displayMinute).toBeGreaterThanOrEqual(4);
    expect(c!.displayMinute).toBeLessThanOrEqual(6);
  });
  it('computeLiveClock second half offset', () => {
    const start = new Date(Date.now()-2*60*1000).toISOString();
    const c = computeLiveClock({status:'LIVE',clockStartedAt:start,matchPeriod:'SECOND_HALF'}, Date.now());
    expect(c!.displayMinute).toBeGreaterThanOrEqual(47);
    expect(c!.periodLabel).toBe('2. poluvrijeme');
  });
  it('computeLiveClock extra period and stoppage flag', () => {
    const start = new Date(Date.now()-20*60*1000).toISOString();
    const c = computeLiveClock({status:'LIVE',clockStartedAt:start,matchPeriod:'FIRST_HALF',stoppageFirstHalf:3}, Date.now());
    // after 45+ min should show stoppage if enabled
    const longStart = new Date(Date.now()-50*60*1000).toISOString();
    const c2 = computeLiveClock({status:'LIVE',clockStartedAt:longStart,matchPeriod:'FIRST_HALF',stoppageFirstHalf:2}, Date.now());
    expect(c2!.showStoppage).toBe(true);
    expect(c2!.stoppage).toBe(2);
    const c3 = computeLiveClock({status:'LIVE',clockStartedAt:longStart,matchPeriod:'FIRST_HALF',stoppageFirstHalf:0}, Date.now());
    expect(c3!.showStoppage).toBe(false);
  });
  it('formatLiveMinute formats with stoppage and fallback', () => {
    expect(formatLiveMinute(null, 7)).toBe(`7'`);
    expect(formatLiveMinute({displayMinute:45,displaySecond:5,periodLabel:'',showStoppage:false,stoppage:0} as any)).toBe('45:05');
    expect(formatLiveMinute({displayMinute:47,displaySecond:0,periodLabel:'',showStoppage:true,stoppage:3} as any)).toBe('47:00 (+3)');
  });
  it('matchEventLabelKey known and fallback', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
  });
  it('matchEventLabelKey all mapped keys', () => {
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
  });
  it('deskCounts and filter parity edge empty inputs', () => {
    expect(filterCommentatorDesk([])).toEqual([]);
    expect(deskCounts([{status:'UNKNOWN'}] as any)).toEqual({live:0,scheduled:0,reports:0});
  });
  it('flattenSeasonEditions handles non-array competitions', () => {
    expect(flattenSeasonEditions([{id:'c1',competitions:null}])).toEqual([]);
  });
});
