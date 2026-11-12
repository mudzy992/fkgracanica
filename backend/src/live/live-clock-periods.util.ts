import { MatchPeriod } from '@prisma/client';

export interface PeriodClockConfig {
  startDisplay: number;
  endMinute: number;
  periodLabel: string;
  stoppageKey:
    | 'stoppageFirstHalf'
    | 'stoppageSecondHalf'
    | 'stoppageExtraFirst'
    | 'stoppageExtraSecond';
}

export const PERIOD_CLOCK: Partial<Record<MatchPeriod, PeriodClockConfig>> = {
  [MatchPeriod.FIRST_HALF]: {
    startDisplay: 0,
    endMinute: 45,
    periodLabel: '1. poluvrijeme',
    stoppageKey: 'stoppageFirstHalf',
  },
  [MatchPeriod.SECOND_HALF]: {
    startDisplay: 46,
    endMinute: 90,
    periodLabel: '2. poluvrijeme',
    stoppageKey: 'stoppageSecondHalf',
  },
  [MatchPeriod.EXTRA_FIRST]: {
    startDisplay: 91,
    endMinute: 105,
    periodLabel: '1. produžetak',
    stoppageKey: 'stoppageExtraFirst',
  },
  [MatchPeriod.EXTRA_SECOND]: {
    startDisplay: 106,
    endMinute: 120,
    periodLabel: '2. produžetak',
    stoppageKey: 'stoppageExtraSecond',
  },
};

export interface StoppageMatch {
  stoppageFirstHalf: number;
  stoppageSecondHalf: number;
  stoppageExtraFirst: number;
  stoppageExtraSecond: number;
}

export function displayMinuteForPeriod(
  period: MatchPeriod,
  minuteInPeriod: number,
): number {
  const config = PERIOD_CLOCK[period];
  if (!config) return 0;
  if (period === MatchPeriod.FIRST_HALF) return minuteInPeriod;
  return config.startDisplay + minuteInPeriod - 1;
}

export function stoppageForPeriod(
  match: StoppageMatch,
  period: MatchPeriod,
): number {
  const key = PERIOD_CLOCK[period]?.stoppageKey;
  if (!key) return 0;
  return match[key];
}

export function stoppageHalfIndex(period: MatchPeriod): 1 | 2 | 3 | 4 | null {
  switch (period) {
    case MatchPeriod.FIRST_HALF:
      return 1;
    case MatchPeriod.SECOND_HALF:
      return 2;
    case MatchPeriod.EXTRA_FIRST:
      return 3;
    case MatchPeriod.EXTRA_SECOND:
      return 4;
    default:
      return null;
  }
}

export function periodDuration(period: MatchPeriod): number {
  const config = PERIOD_CLOCK[period];
  if (!config) return 45;
  return (
    config.endMinute -
    config.startDisplay +
    (period === MatchPeriod.FIRST_HALF ? 0 : 1)
  );
}
