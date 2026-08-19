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

export function useTeamAnalytics(seasonId?: string) {
  return useQuery({
    queryKey: ['analytics', 'team', seasonId],
    queryFn: async () =>
      (await api.get<TeamAnalytics>('/analytics/team', { params: seasonId ? { seasonId } : undefined })).data,
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

export function usePlayerAnalytics(playerId?: string) {
  return useQuery({
    queryKey: ['analytics', 'player', playerId],
    queryFn: async () =>
      (await api.get<PlayerAnalytics>(`/analytics/players/${playerId}`)).data,
    enabled: Boolean(playerId),
  });
}

export function useH2H(clubAId?: string, clubBId?: string) {
  return useQuery({
    queryKey: ['analytics', 'h2h', clubAId, clubBId],
    queryFn: async () =>
      (await api.get<H2HAnalytics>('/analytics/h2h', { params: { clubAId, clubBId } })).data,
    enabled: Boolean(clubAId && clubBId && clubAId !== clubBId),
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

export function useVisitorTrend(days = 30) {
  return useQuery({
    queryKey: ['analytics', 'visitors', 'trend', days],
    queryFn: async () =>
      (await api.get<VisitorTrendRow[]>('/public-analytics/trend', { params: { days } })).data,
  });
}

export function useVisitorTotals(days = 30) {
  return useQuery({
    queryKey: ['analytics', 'visitors', 'totals', days],
    queryFn: async () =>
      (await api.get<VisitorTotals>('/public-analytics/totals', { params: { days } })).data,
  });
}
