import { useEffect, useRef, useState } from 'react';
import { pickRandomStatItem, type LiveStatItem } from '../lib/live-stats-feed';

const SHOW_MS = { min: 8000, max: 12000 };
const GAP_MS = { min: 120_000, max: 240_000 };
const FIRST_MS = { min: 45_000, max: 90_000 };

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function useLiveStatsPopup(items: LiveStatItem[]) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<LiveStatItem | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setVisible(false);
    setActive(null);
    if (!items.length) return;

    const schedule = (delay: number, fn: () => void) => {
      const id = window.setTimeout(fn, delay);
      timers.current.push(id);
    };

    const showNext = (excludeId?: string) => {
      const next = pickRandomStatItem(items, excludeId)!;
      setActive(next);
      setVisible(true);
      schedule(randBetween(SHOW_MS.min, SHOW_MS.max), () => {
        setVisible(false);
        schedule(randBetween(GAP_MS.min, GAP_MS.max), () => showNext(next.id));
      });
    };

    schedule(randBetween(FIRST_MS.min, FIRST_MS.max), () => showNext());
    return () => timers.current.forEach((id) => window.clearTimeout(id));
  }, [items]);

  return { visible, active };
}
