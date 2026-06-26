export interface TeamMatchStats {
  clubId: string;
  goals: number;
  shots: number;
  shotsOn: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  possession: number | null;
}

export interface PlayerMatchStat {
  playerId: string;
  firstName: string;
  lastName: string;
  isStarter: boolean;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  shots: number;
  shotsOn: number;
}

export interface MatchStatisticsOverview {
  team: { home: TeamMatchStats; away: TeamMatchStats };
  players: { home: PlayerMatchStat[]; away: PlayerMatchStat[] };
}
