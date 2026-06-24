import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getRealtimeSocket } from '../lib/realtime';
import type { Match, MatchEvent } from '../types';

interface MatchScore {
  homeScore: number;
  awayScore: number;
  minute: number;
}

export function useMatchRealtime(matchId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!matchId) return;
    const socket = getRealtimeSocket();

    const join = () => socket.emit('match:join', { matchId });
    if (socket.connected) join();
    else socket.on('connect', join);

    const patch = (partial: Partial<Match>) => {
      qc.setQueryData<Match>(['matches', matchId], (old) => (old ? { ...old, ...partial } : old));
    };

    const onEvent = (event: MatchEvent) => {
      qc.setQueryData<Match>(['matches', matchId], (old) =>
        old ? { ...old, events: [...(old.events ?? []), event] } : old,
      );
    };

    const onScore = (score: MatchScore) => patch(score);
    const onStatus = (status: Partial<Match>) => patch(status);

    socket.on('match:event', onEvent);
    socket.on('match:score', onScore);
    socket.on('match:status', onStatus);

    return () => {
      socket.off('connect', join);
      socket.off('match:event', onEvent);
      socket.off('match:score', onScore);
      socket.off('match:status', onStatus);
      socket.emit('match:leave', { matchId });
    };
  }, [matchId, qc]);
}
