import { MatchPeriod, MatchStatus } from '@prisma/client';
import { computeLiveClock, formatLiveMinute } from './live-clock.util';

describe('live-clock.util', () => {
  const base = {
    status: MatchStatus.LIVE,
    clockStartedAt: new Date(Date.now() - 46 * 60_000),
    matchPeriod: MatchPeriod.FIRST_HALF,
    stoppageFirstHalf: 6,
    stoppageSecondHalf: 0,
    stoppageExtraFirst: 0,
    stoppageExtraSecond: 0,
  };

  it('formats stoppage display', () => {
    const state = computeLiveClock(base);
    expect(state?.showStoppage).toBe(true);
    expect(formatLiveMinute(state!)).toBe('46:00 (+6)');
  });

  it('prompts stoppage after 45 without announcement', () => {
    const state = computeLiveClock({
      ...base,
      stoppageFirstHalf: 0,
      clockStartedAt: new Date(Date.now() - 46 * 60_000),
    });
    expect(state?.needsStoppageInput).toBe(true);
  });
});
