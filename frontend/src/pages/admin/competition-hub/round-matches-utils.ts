import { useMemo } from 'react';
import type { Match } from '../../../types';

export function useRoundMatchesSorted(matches: Match[] | undefined) {
  return useMemo(() => {
    if (!matches?.length) return [];
    return [...matches].sort((a, b) => {
      const aSched = a.status === 'SCHEDULED' ? 0 : 1;
      const bSched = b.status === 'SCHEDULED' ? 0 : 1;
      if (aSched !== bSched) return aSched - bSched;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
  }, [matches]);
}

export function isScheduledMatch(match: Match) {
  return match.status === 'SCHEDULED';
}
