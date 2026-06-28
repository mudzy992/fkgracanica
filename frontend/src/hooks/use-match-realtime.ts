import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getRealtimeSocket } from '../lib/realtime';
import type { LiveClockState } from '../lib/live-clock';
import type { LiveComment, Match, MatchEvent } from '../types';

interface MatchScore {
  homeScore: number;
  awayScore: number;
  minute: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
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

    const onComment = (comment: LiveComment) => {
      qc.setQueryData<Match>(['matches', matchId], (old) =>
        old ? { ...old, liveComments: [...(old.liveComments ?? []), comment] } : old,
      );
    };

    const onClock = (clock: LiveClockState) => {
      qc.setQueryData<Match>(['matches', matchId], (old) =>
        old ? { ...old, minute: clock.displayMinute } : old,
      );
    };

    const onScore = (score: MatchScore) => patch(score);
    const onStatus = (status: Partial<Match>) => patch(status);

    socket.on('match:event', onEvent);
    socket.on('match:comment', onComment);
    socket.on('match:clock', onClock);
    socket.on('match:score', onScore);
    socket.on('match:status', onStatus);

    return () => {
      socket.off('connect', join);
      socket.off('match:event', onEvent);
      socket.off('match:comment', onComment);
      socket.off('match:clock', onClock);
      socket.off('match:score', onScore);
      socket.off('match:status', onStatus);
      socket.emit('match:leave', { matchId });
    };
  }, [matchId, qc]);
}
