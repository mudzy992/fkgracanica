import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { NewsItem } from '../types';

import type { MatchStatisticsOverview } from '../types/match-stats';

export interface LeaderRow {
  playerId: string;
  firstName: string;
  lastName: string;
  value: number;
}

export interface TeamStatRow {
  id: string;
  matchId: string;
  clubId: string;
  shots: number;
  shotsOn: number;
  corners: number;
  fouls: number;
  possession?: number | null;
}

export function useTopScorers(seasonId?: string) {
  return useQuery({
    queryKey: ['statistics', 'top-scorers', seasonId],
    queryFn: async () =>
      (await api.get<LeaderRow[]>('/statistics/top-scorers', { params: { seasonId } })).data,
    enabled: !!seasonId,
  });
}

export function useTopAssists(seasonId?: string) {
  return useQuery({
    queryKey: ['statistics', 'top-assists', seasonId],
    queryFn: async () =>
      (await api.get<LeaderRow[]>('/statistics/top-assists', { params: { seasonId } })).data,
    enabled: !!seasonId,
  });
}

export function useMatchStatistics(matchId?: string) {
  return useQuery({
    queryKey: ['statistics', 'match-overview', matchId],
    queryFn: async () =>
      (await api.get<MatchStatisticsOverview>(`/statistics/matches/${matchId}/overview`)).data,
    enabled: !!matchId,
  });
}

export function useTeamStats(matchId?: string) {
  return useQuery({
    queryKey: ['statistics', 'team', matchId],
    queryFn: async () =>
      (await api.get<TeamStatRow[]>(`/statistics/matches/${matchId}`)).data,
    enabled: !!matchId,
  });
}

export function useNewsForMatch(matchId?: string) {
  return useQuery({
    queryKey: ['news', 'for-match', matchId],
    queryFn: async () => {
      const all = asArray<NewsItem>((await api.get('/news/published')).data);
      return all.filter((n) =>
        n.relatedMatches?.some((rm) => rm.matchId === matchId || rm.match?.id === matchId),
      );
    },
    enabled: !!matchId,
  });
}
