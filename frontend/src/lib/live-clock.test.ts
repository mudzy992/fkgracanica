import { describe, expect, it } from 'vitest';
import { computeLiveClock, formatLiveMinute } from './live-clock';

const start = '2026-01-01T12:00:00.000Z';
const startMs = Date.parse(start);
const at = (minutes: number, seconds = 0) => startMs + (minutes * 60 + seconds) * 1000;

describe('live match clock', () => {
  it('ne prikazuje sat za zakazanu utakmicu, nepoznatu fazu ili bez starta', () => {
    expect(computeLiveClock({ status: 'SCHEDULED', clockStartedAt: start, matchPeriod: 'FIRST_HALF' }, at(2))).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', matchPeriod: 'FIRST_HALF' }, at(2))).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'PENALTIES' }, at(2))).toBeNull();
    expect(formatLiveMinute(null, 12)).toBe('12:00');
  });

  it('prikazuje minute i sekunde i ne ide ispod nule za budući start', () => {
    const state = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF' }, at(30, 5));
    expect(state).toMatchObject({ displayMinute: 30, displaySecond: 5, showStoppage: false, needsStoppageInput: false });
    expect(formatLiveMinute(state)).toBe('30:05');
    const future = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF' }, startMs - 5000);
    expect(formatLiveMinute(future)).toBe('0:00');
  });

  it('traži unos nadoknade na kraju poluvremena i prikazuje unijetu nadoknadu', () => {
    const base = { status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF' as const };
    expect(computeLiveClock(base, at(45))?.needsStoppageInput).toBe(true);
    const added = computeLiveClock({ ...base, stoppageFirstHalf: 3 }, at(46, 9));
    expect(added).toMatchObject({ stoppage: 3, showStoppage: true, needsStoppageInput: false });
    expect(formatLiveMinute(added)).toBe('46:09 (+3)');
  });

  it.each([
    ['SECOND_HALF', 45, 90, '2. poluvrijeme'],
    ['EXTRA_FIRST', 15, 105, '1. produžetak'],
    ['EXTRA_SECOND', 15, 120, '2. produžetak'],
  ] as const)('računa granicu faze %s', (matchPeriod, minutes, displayMinute, periodLabel) => {
    const state = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod }, at(minutes));
    expect(state).toMatchObject({ displayMinute, periodLabel, needsStoppageInput: true });
  });
});
