import { useEffect } from 'react';
import { getRealtimeSocket } from '../lib/realtime';
import { asRecord, asString } from '../lib/content-helpers';
import type { Match } from '../types/api';

function shouldJoin(match: Match): boolean {
  return match.status === 'LIVE' || match.status === 'HALFTIME' || match.status === 'SCHEDULED';
}

export function useLiveListSocket(
  matches: Match[],
  patchMatch: (id: string, partial: Partial<Match>) => void,
  refetch: () => void,
): void {
  const liveIds = matches.filter(shouldJoin).map((match) => match.id).sort().join(',');

  useEffect(() => {
    const ids = liveIds ? liveIds.split(',') : [];
    const socket = getRealtimeSocket();
    const joinAll = () => ids.forEach((id) => socket.emit('match:join', { matchId: id }));
    const onConnect = () => {
      joinAll();
      refetch();
    };
    const onScore = (payload: unknown) => {
      const record = asRecord(payload);
      const id = asString(record.id);
      if (!id) return;
      patchMatch(id, record as Partial<Match>);
    };
    const onStatus = (payload: unknown) => {
      const record = asRecord(payload);
      const id = asString(record.id);
      if (!id) return;
      patchMatch(id, record as Partial<Match>);
    };

    socket.on('connect', onConnect);
    socket.on('match:score', onScore);
    socket.on('match:status', onStatus);
    if (socket.connected) joinAll();

    return () => {
      ids.forEach((id) => socket.emit('match:leave', { matchId: id }));
      socket.off('connect', onConnect);
      socket.off('match:score', onScore);
      socket.off('match:status', onStatus);
    };
  }, [liveIds, patchMatch, refetch]);
}
