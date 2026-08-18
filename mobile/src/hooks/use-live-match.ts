import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getRealtimeSocket } from '../lib/realtime';
import type { Match, MatchEvent } from '../types/api';

export type LiveClock = {
  displayMinute: number;
  displaySecond?: number;
  periodLabel?: string;
};

export function useLiveMatch(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [clock, setClock] = useState<LiveClock | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<MatchEvent | null>(null);

  const patch = useCallback((partial: Partial<Match>) => {
    setMatch((old) => (old ? { ...old, ...partial } : old));
  }, []);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    void api.get<Match>(`/matches/${matchId}`).then(({ data }) => {
      if (!cancelled) setMatch(data);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    const socket = getRealtimeSocket();
    const join = () => socket.emit('match:join', { matchId });
    const onConnect = () => {
      setConnected(true);
      join();
    };
    const onEvent = (event: MatchEvent) => {
      setMatch((old) => (old ? { ...old, events: [...(old.events ?? []), event] } : old));
      if (event.type === 'GOAL' || event.type === 'YELLOW_CARD' || event.type === 'RED_CARD') {
        setToast(event);
      }
    };
    const onDisconnect = () => setConnected(false);
    const onClock = (payload: LiveClock) => setClock(payload);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('match:event', onEvent);
    socket.on('match:score', patch);
    socket.on('match:status', patch);
    socket.on('match:clock', onClock);
    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.emit('match:leave', { matchId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('match:event', onEvent);
      socket.off('match:score', patch);
      socket.off('match:status', patch);
      socket.off('match:clock', onClock);
    };
  }, [matchId, patch]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  return { match, clock, connected, loading, toast };
}
