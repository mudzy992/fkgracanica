import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { disconnectRealtimeSocket, getRealtimeSocket } from '../lib/realtime';
import type { Match, MatchEvent } from '../types/api';

export function useLiveMatch(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const patch = useCallback((partial: Partial<Match>) => {
    setMatch((old) => (old ? { ...old, ...partial } : old));
  }, []);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await api.get<Match>(`/matches/${matchId}`);
        if (!cancelled) setMatch(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();

    const socket = getRealtimeSocket();
    const join = () => socket.emit('match:join', { matchId });
    const onConnect = () => {
      setConnected(true);
      join();
    };
    const onDisconnect = () => setConnected(false);
    const onEvent = (event: MatchEvent) => {
      setMatch((old) =>
        old ? { ...old, events: [...(old.events ?? []), event] } : old,
      );
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('match:event', onEvent);
    socket.on('match:score', patch);
    socket.on('match:status', patch);

    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.emit('match:leave', { matchId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('match:event', onEvent);
      socket.off('match:score', patch);
      socket.off('match:status', patch);
      disconnectRealtimeSocket();
    };
  }, [matchId, patch]);

  return { match, connected, loading };
}
