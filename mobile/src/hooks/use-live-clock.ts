import { useEffect, useState } from 'react';
import { computeLiveClock, type LiveClockMatch, type LiveClockState } from '../lib/live-clock';

export function useLiveClock(match: LiveClockMatch | null | undefined): LiveClockState | null {
  const [now, setNow] = useState(Date.now());
  const live = match?.status === 'LIVE';
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [live, match?.clockStartedAt, match?.matchPeriod]);
  return match ? computeLiveClock(match, now) : null;
}
