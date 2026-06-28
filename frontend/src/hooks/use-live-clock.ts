import { useEffect, useState } from 'react';
import { computeLiveClock, type LiveClockMatch, type LiveClockState } from '../lib/live-clock';

export function useLiveClock(match: LiveClockMatch | undefined) {
  const [clock, setClock] = useState<LiveClockState | null>(null);

  useEffect(() => {
    if (!match) {
      setClock(null);
      return;
    }
    const tick = () => setClock(computeLiveClock(match));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [
    match?.status,
    match?.clockStartedAt,
    match?.matchPeriod,
    match?.stoppageFirstHalf,
    match?.stoppageSecondHalf,
  ]);

  return clock;
}
