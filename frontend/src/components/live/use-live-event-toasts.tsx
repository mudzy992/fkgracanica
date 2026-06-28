import { useEffect, useState } from 'react';
import type { MatchEvent } from '../../types';
import { matchEventLabel } from '../../lib/match-event-labels';
import { formatEventPlayers } from '../../lib/live-event-text';

const TOAST_MS: Record<string, number> = {
  GOAL: 15_000,
  OWN_GOAL: 15_000,
  PENALTY_SCORED: 15_000,
  YELLOW_CARD: 8_000,
  RED_CARD: 10_000,
  PENALTY_MISSED: 8_000,
  SUBSTITUTION: 7_000,
};

const DEFAULT_TOAST_MS = 8_000;

export function useLiveEventToasts(events: MatchEvent[] | undefined) {
  const [toast, setToast] = useState<MatchEvent | null>(null);

  useEffect(() => {
    if (!events?.length) return;
    const latest = events[events.length - 1];
    if (['KICKOFF', 'HALFTIME', 'SECOND_HALF', 'COMMENT'].includes(latest.type)) {
      if (latest.description?.includes('Sudijska')) setToast(latest);
      return;
    }
    if (['GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'PENALTY_SCORED', 'PENALTY_MISSED', 'SUBSTITUTION'].includes(latest.type)) {
      setToast(latest);
    }
  }, [events?.length, events?.[events.length - 1]?.id]);

  useEffect(() => {
    if (!toast) return;
    const ms = TOAST_MS[toast.type] ?? DEFAULT_TOAST_MS;
    const id = window.setTimeout(() => setToast(null), ms);
    return () => window.clearTimeout(id);
  }, [toast?.id, toast?.type]);

  return toast;
}

function toastClass(type: string) {
  if (type === 'GOAL' || type === 'PENALTY_SCORED') return 'live-toast-goal bg-primary/95 text-white';
  if (type === 'OWN_GOAL') return 'live-toast-goal bg-black/90 text-white ring-2 ring-amber-400/50';
  if (type === 'YELLOW_CARD') return 'live-toast-card live-toast-yellow bg-black/90 text-white ring-2 ring-yellow-400/40';
  if (type === 'RED_CARD') return 'live-toast-card live-toast-red bg-black/90 text-white ring-2 ring-red-500/50';
  if (type === 'PENALTY_MISSED') return 'live-toast-penalty bg-slate-900/95 text-white ring-2 ring-white/20';
  if (type === 'SUBSTITUTION') return 'live-toast-sub bg-black/85 text-white';
  return 'bg-black/85 text-white';
}

export function LiveEventToast({ event }: { event: MatchEvent }) {
  const players = formatEventPlayers(event);

  return (
    <div
      className={`pointer-events-none animate-in fade-in slide-in-from-bottom-4 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-md ${toastClass(event.type)}`}
    >
      <p className="text-xs uppercase tracking-widest opacity-80">{event.minute}&apos;</p>
      <p className="font-display text-xl font-bold">{matchEventLabel(event.type)}</p>
      {players && <p className="mt-1 text-sm opacity-90">{players}</p>}
      {event.description && !players && <p className="mt-1 text-sm opacity-90">{event.description}</p>}
    </div>
  );
}
