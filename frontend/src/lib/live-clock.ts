import {
  displayMinuteForPeriod,
  PERIOD_CLOCK,
  periodDuration,
  stoppageForPeriod,
  type MatchPeriod,
  type StoppageMatch,
} from './match-live-phase';

export type { MatchPeriod };

export interface LiveClockState {
  displayMinute: number;
  displaySecond: number;
  stoppage: number;
  showStoppage: boolean;
  periodLabel: string;
  needsStoppageInput: boolean;
}

export interface LiveClockMatch extends StoppageMatch {
  status: string;
  clockStartedAt?: string | null;
  matchPeriod?: MatchPeriod | null;
}

export function computeLiveClock(match: LiveClockMatch, now = Date.now()): LiveClockState | null {
  if (match.status !== 'LIVE' || !match.clockStartedAt || !match.matchPeriod) return null;
  const config = PERIOD_CLOCK[match.matchPeriod];
  if (!config) return null;

  const elapsedSec = Math.max(
    Math.floor((now - new Date(match.clockStartedAt).getTime()) / 1000),
    0,
  );
  const minuteInPeriod = Math.floor(elapsedSec / 60);
  const displaySecond = elapsedSec % 60;
  const displayMinute = displayMinuteForPeriod(match.matchPeriod, minuteInPeriod);
  const stoppage = stoppageForPeriod(match, match.matchPeriod);
  const duration = periodDuration(match.matchPeriod);

  return {
    displayMinute,
    displaySecond,
    stoppage,
    showStoppage: displayMinute > config.endMinute && stoppage > 0,
    periodLabel: config.periodLabel,
    needsStoppageInput: minuteInPeriod >= duration && stoppage === 0,
  };
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatLiveMinute(state: LiveClockState | null, fallback = 0): string {
  if (!state) return `${fallback}:00`;
  const time = `${state.displayMinute}:${pad2(state.displaySecond)}`;
  if (state.showStoppage) return `${time} (+${state.stoppage})`;
  return time;
}
