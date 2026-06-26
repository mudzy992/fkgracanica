import type { Player, PlayerPosition } from '../types';

export interface Stadium {
  id: string;
  clubId: string;
  name: string;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  imagePath?: string | null;
  capacity?: number | null;
  description?: string | null;
}

export interface ClubSquadSlot {
  id: string;
  clubId: string;
  slotIndex: number;
  lineRole: PlayerPosition;
  positionX: number;
  positionY: number;
  isBench: boolean;
  benchOrder?: number | null;
  playerId?: string | null;
  player?: Player | null;
}

export interface ClubSquadResponse {
  formation: { def: number; mid: number; fwd: number };
  slots: ClubSquadSlot[];
}

export interface PlayerSeasonStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
}

export interface ClubSeasonStats {
  season: { id: string; name: string } | null;
  standing: {
    clubId: string;
    clubName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form: string;
  } | null;
  totals: PlayerSeasonStats;
  players: {
    id: string;
    firstName: string;
    lastName: string;
    number?: number | null;
    position?: string | null;
    stats: PlayerSeasonStats | null;
  }[];
}
