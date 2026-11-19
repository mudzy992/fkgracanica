import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export type TeamAnalytics = {
  clubId: string;
  clubName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  winPercent: number;
  form: ('W' | 'D' | 'L')[];
  recent: {
    id: string;
    scheduledAt: string;
    status: string;
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
  }[];
};

export type H2HAnalytics = {
  played: number;
  clubA: { wins: number; draws: number; losses: number };
  clubB: { wins: number; draws: number; losses: number };
  matches: TeamAnalytics['recent'];
};

export function useTeamAnalytics(
  seasonId?: string,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<TeamAnalytics>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['analytics', 'team', seasonId],
    queryFn: async () =>
      (await api.get<TeamAnalytics>('/analytics/team', { params: seasonId ? { seasonId } : undefined })).data,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export type PlayerSeasonRow = {
  seasonId: string;
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
};

export type PlayerAnalytics = {
  totals: Omit<PlayerSeasonRow, 'seasonId'>;
  seasons: PlayerSeasonRow[];
};

export function usePlayerAnalytics(
  playerId?: string,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<PlayerAnalytics>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['analytics', 'player', playerId],
    queryFn: async () =>
      (await api.get<PlayerAnalytics>(`/analytics/players/${playerId}`)).data,
    enabled: Boolean(playerId),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useH2H(
  clubAId?: string,
  clubBId?: string,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<H2HAnalytics>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['analytics', 'h2h', clubAId, clubBId],
    queryFn: async () =>
      (await api.get<H2HAnalytics>('/analytics/h2h', { params: { clubAId, clubBId } })).data,
    enabled: Boolean(clubAId && clubBId && clubAId !== clubBId),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export type VisitorTrendRow = {
  date: string;
  web: number;
  mobile: number;
  total: number;
};

export type VisitorTotals = {
  web: number;
  mobile: number;
  total: number;
};

export function useVisitorTrend(
  days = 30,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<VisitorTrendRow[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['analytics', 'visitors', 'trend', days],
    queryFn: async () =>
      (await api.get<VisitorTrendRow[]>('/public-analytics/trend', { params: { days } })).data,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useVisitorTotals(
  days = 30,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<VisitorTotals>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['analytics', 'visitors', 'totals', days],
    queryFn: async () =>
      (await api.get<VisitorTotals>('/public-analytics/totals', { params: { days } })).data,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export type VisitorGeoRow = {
  countryCode: string;
  count: number;
  percent: number;
};

export function useVisitorGeo(
  days = 30,
  options?: Omit<import('@tanstack/react-query').UseQueryOptions<VisitorGeoRow[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['analytics', 'visitors', 'geo', days],
    queryFn: async () =>
      (await api.get<VisitorGeoRow[]>('/public-analytics/geo', { params: { days } })).data,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}
