import { describe, expect, it } from 'vitest';
import { canExtraHalftime, canHalftime, displayMinuteForPeriod, isPenaltiesPhase, isTied, periodDuration, stoppageForPeriod, stoppageHalfIndex, type MatchPeriod } from './match-live-phase';

describe('period i sat live utakmice', () => {
  it.each([
    ['FIRST_HALF', 1, 1, 45, 1], ['SECOND_HALF', 1, 46, 45, 2],
    ['EXTRA_FIRST', 1, 91, 15, 3], ['EXTRA_SECOND', 1, 106, 15, 4],
    ['PENALTIES', 1, 0, 45, null],
  ] as Array<[MatchPeriod, number, number, number, 1 | 2 | 3 | 4 | null]>)('%s računa granicu i trajanje', (period, minute, display, duration, half) => {
    expect(displayMinuteForPeriod(period, minute)).toBe(display);
    expect(periodDuration(period)).toBe(duration);
    expect(stoppageHalfIndex(period)).toBe(half);
  });

  it('uzima samo nadoknadu odgovarajućeg perioda', () => {
    const match = { stoppageFirstHalf: 2, stoppageSecondHalf: 5, stoppageExtraFirst: 1, stoppageExtraSecond: 3 };
    expect(stoppageForPeriod(match, 'FIRST_HALF')).toBe(2);
    expect(stoppageForPeriod(match, 'SECOND_HALF')).toBe(5);
    expect(stoppageForPeriod(match, 'EXTRA_FIRST')).toBe(1);
    expect(stoppageForPeriod(match, 'EXTRA_SECOND')).toBe(3);
    expect(stoppageForPeriod({}, 'FIRST_HALF')).toBe(0);
    expect(stoppageForPeriod(match, 'PENALTIES')).toBe(0);
    expect(stoppageHalfIndex(undefined)).toBeNull();
  });

  it('status i period ograničavaju dostupne prijelaze', () => {
    expect(canHalftime({ status: 'LIVE', matchPeriod: 'FIRST_HALF' })).toBe(true);
    expect(canHalftime({ status: 'FINISHED', matchPeriod: 'FIRST_HALF' })).toBe(false);
    expect(canHalftime({ status: 'LIVE', matchPeriod: 'SECOND_HALF' })).toBe(false);
    expect(canExtraHalftime({ status: 'LIVE', matchPeriod: 'EXTRA_FIRST' })).toBe(true);
    expect(canExtraHalftime({ status: 'LIVE', matchPeriod: 'FIRST_HALF' })).toBe(false);
    expect(isPenaltiesPhase({ matchPeriod: 'PENALTIES' })).toBe(true);
    expect(isPenaltiesPhase({})).toBe(false);
    expect(isTied({ homeScore: 1, awayScore: 1 })).toBe(true);
    expect(isTied({ homeScore: 2, awayScore: 1 })).toBe(false);
  });
});
