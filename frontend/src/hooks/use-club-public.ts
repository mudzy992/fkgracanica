import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Club, Player } from '../types';
import type { ClubSeasonStats, ClubSquadResponse, Stadium } from '../types/club-hub';

export interface ClubPublicLastMatch {
  matchId: string;
  scheduledAt: string;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  opponent: { id: string; name: string; slug: string };
  lineup: {
    id: string;
    playerId: string;
    positionX?: number | null;
    positionY?: number | null;
    isStarter: boolean;
    player?: Player | null;
  }[];
}

export interface ClubPublicProfile {
  club: Club;
  stadium: Stadium | null;
  squad: ClubSquadResponse;
  seasonStats: ClubSeasonStats;
  players: Player[];
  lastMatch: ClubPublicLastMatch | null;
}

export function useClubPublic(slug: string) {
  return useQuery({
    queryKey: ['clubs', 'public', slug],
    queryFn: async () => (await api.get<ClubPublicProfile>(`/clubs/public/${slug}`)).data,
    enabled: !!slug,
  });
}

export interface PlayerPublicProfile extends Player {
  club?: { id: string; name: string; slug: string; crestPath?: string | null; isOwnClub?: boolean } | null;
  season?: { id: string; name: string } | null;
  seasonStats?: {
    appearances: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutes: number;
  } | null;
  careerTotals?: {
    appearances: number | null;
    goals: number | null;
    assists: number | null;
    yellowCards: number | null;
    redCards: number | null;
    minutes: number | null;
  };
}

export function usePlayerPublic(id: string) {
  return useQuery({
    queryKey: ['players', 'public', id],
    queryFn: async () => (await api.get<PlayerPublicProfile>(`/players/${id}/public`)).data,
    enabled: !!id,
  });
}
