export type MatchPeriod =
  | 'FIRST_HALF'
  | 'SECOND_HALF'
  | 'EXTRA_FIRST'
  | 'EXTRA_SECOND'
  | 'PENALTIES';

export type LiveBreak =
  | 'NONE'
  | 'REGULAR_HT'
  | 'ET_HT'
  | 'POST_REGULATION'
  | 'POST_EXTRA';

export interface PeriodClockConfig {
  startDisplay: number;
  endMinute: number;
  periodLabel: string;
  stoppageKey: 'stoppageFirstHalf' | 'stoppageSecondHalf' | 'stoppageExtraFirst' | 'stoppageExtraSecond';
}

export const PERIOD_CLOCK: Partial<Record<MatchPeriod, PeriodClockConfig>> = {
  FIRST_HALF: {
    startDisplay: 0,
    endMinute: 45,
    periodLabel: '1. poluvrijeme',
    stoppageKey: 'stoppageFirstHalf',
  },
  SECOND_HALF: {
    startDisplay: 46,
    endMinute: 90,
    periodLabel: '2. poluvrijeme',
    stoppageKey: 'stoppageSecondHalf',
  },
  EXTRA_FIRST: {
    startDisplay: 91,
    endMinute: 105,
    periodLabel: '1. produžetak',
    stoppageKey: 'stoppageExtraFirst',
  },
  EXTRA_SECOND: {
    startDisplay: 106,
    endMinute: 120,
    periodLabel: '2. produžetak',
    stoppageKey: 'stoppageExtraSecond',
  },
};

export interface StoppageMatch {
  stoppageFirstHalf?: number;
  stoppageSecondHalf?: number;
  stoppageExtraFirst?: number;
  stoppageExtraSecond?: number;
}

export function displayMinuteForPeriod(period: MatchPeriod, minuteInPeriod: number): number {
  if (period === 'FIRST_HALF') return minuteInPeriod;
  const config = PERIOD_CLOCK[period];
  if (!config) return 0;
  return config.startDisplay + minuteInPeriod - 1;
}

export function stoppageForPeriod(match: StoppageMatch, period: MatchPeriod): number {
  const key = PERIOD_CLOCK[period]?.stoppageKey;
  if (!key) return 0;
  return match[key] ?? 0;
}

export function stoppageHalfIndex(period: MatchPeriod | null | undefined): 1 | 2 | 3 | 4 | null {
  switch (period) {
    case 'FIRST_HALF':
      return 1;
    case 'SECOND_HALF':
      return 2;
    case 'EXTRA_FIRST':
      return 3;
    case 'EXTRA_SECOND':
      return 4;
    default:
      return null;
  }
}

export function periodDuration(period: MatchPeriod): number {
  const config = PERIOD_CLOCK[period];
  if (!config) return 45;
  return config.endMinute - config.startDisplay + (period === 'FIRST_HALF' ? 0 : 1);
}

export function isTied(match: { homeScore: number; awayScore: number }) {
  return match.homeScore === match.awayScore;
}

export function isPenaltiesPhase(match: { matchPeriod?: MatchPeriod | null }) {
  return match.matchPeriod === 'PENALTIES';
}

export function canHalftime(match: { status: string; matchPeriod?: MatchPeriod | null }) {
  return match.status === 'LIVE' && match.matchPeriod === 'FIRST_HALF';
}

export function canExtraHalftime(match: { status: string; matchPeriod?: MatchPeriod | null }) {
  return match.status === 'LIVE' && match.matchPeriod === 'EXTRA_FIRST';
}
