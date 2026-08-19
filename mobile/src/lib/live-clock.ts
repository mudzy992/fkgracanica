export type LiveClockState = {
  displayMinute: number;
  displaySecond: number;
  periodLabel: string;
  showStoppage: boolean;
  stoppage: number;
};

type Period = 'FIRST_HALF' | 'SECOND_HALF' | 'EXTRA_FIRST' | 'EXTRA_SECOND';
type StoppageKey = 'stoppageFirstHalf' | 'stoppageSecondHalf' | 'stoppageExtraFirst' | 'stoppageExtraSecond';

export type LiveClockMatch = {
  status: string;
  clockStartedAt?: string | null;
  matchPeriod?: string | null;
  stoppageFirstHalf?: number;
  stoppageSecondHalf?: number;
  stoppageExtraFirst?: number;
  stoppageExtraSecond?: number;
};

const PERIODS: Record<Period, { start: number; end: number; label: string; stoppage: StoppageKey }> = {
  FIRST_HALF: { start: 0, end: 45, label: '1. poluvrijeme', stoppage: 'stoppageFirstHalf' },
  SECOND_HALF: { start: 46, end: 90, label: '2. poluvrijeme', stoppage: 'stoppageSecondHalf' },
  EXTRA_FIRST: { start: 91, end: 105, label: '1. produžetak', stoppage: 'stoppageExtraFirst' },
  EXTRA_SECOND: { start: 106, end: 120, label: '2. produžetak', stoppage: 'stoppageExtraSecond' },
};

function isPeriod(value: string | null | undefined): value is Period {
  return !!value && value in PERIODS;
}

export function computeLiveClock(match: LiveClockMatch, now = Date.now()): LiveClockState | null {
  if (match.status !== 'LIVE' || !match.clockStartedAt || !isPeriod(match.matchPeriod)) return null;
  const config = PERIODS[match.matchPeriod];
  const elapsedSec = Math.max(Math.floor((now - new Date(match.clockStartedAt).getTime()) / 1000), 0);
  const minuteInPeriod = Math.floor(elapsedSec / 60);
  const displayMinute =
    match.matchPeriod === 'FIRST_HALF' ? minuteInPeriod : config.start + minuteInPeriod - 1;
  const stoppage = Number(match[config.stoppage] ?? 0);
  return {
    displayMinute,
    displaySecond: elapsedSec % 60,
    periodLabel: config.label,
    showStoppage: displayMinute > config.end && stoppage > 0,
    stoppage,
  };
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatLiveMinute(clock: LiveClockState | null, fallback = 0): string {
  if (!clock) return `${fallback}'`;
  const time = `${clock.displayMinute}:${pad2(clock.displaySecond)}`;
  return clock.showStoppage ? `${time} (+${clock.stoppage})` : time;
}
