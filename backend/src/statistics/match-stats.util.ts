import { MatchEventType, type MatchEvent, type MatchLineup, type TeamStatistics } from '@prisma/client';

export type TeamSide = 'home' | 'away';

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
  ownGoals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  shots: number;
  shotsOn: number;
}

type EventRow = Pick<MatchEvent, 'type' | 'teamSide' | 'playerId' | 'relatedPlayerId'>;
type LineupRow = MatchLineup & {
  player?: { id: string; firstName: string; lastName: string; clubId: string | null } | null;
};

function emptyTeamStats(clubId: string): TeamMatchStats {
  return {
    clubId,
    goals: 0,
    shots: 0,
    shotsOn: 0,
    corners: 0,
    fouls: 0,
    offsides: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
    penaltiesScored: 0,
    penaltiesMissed: 0,
    possession: null,
  };
}

export function resolveEventSide(
  event: EventRow,
  homeClubId: string,
  awayClubId: string,
  playerClubById: Map<string, string>,
): TeamSide | null {
  if (event.teamSide === 'home' || event.teamSide === 'away') return event.teamSide;
  if (!event.playerId) return null;
  const clubId = playerClubById.get(event.playerId);
  if (clubId === homeClubId) return 'home';
  if (clubId === awayClubId) return 'away';
  return null;
}

function bumpTeamStat(stats: TeamMatchStats, type: MatchEventType) {
  switch (type) {
    case MatchEventType.CORNER:
      stats.corners++;
      break;
    case MatchEventType.FOUL:
      stats.fouls++;
      break;
    case MatchEventType.OFFSIDE:
      stats.offsides++;
      break;
    case MatchEventType.SHOT:
      stats.shots++;
      break;
    case MatchEventType.SHOT_ON_TARGET:
      stats.shots++;
      stats.shotsOn++;
      break;
    case MatchEventType.YELLOW_CARD:
      stats.yellowCards++;
      break;
    case MatchEventType.RED_CARD:
    case MatchEventType.SECOND_YELLOW:
      stats.redCards++;
      break;
    case MatchEventType.SAVE:
      stats.saves++;
      break;
    case MatchEventType.PENALTY_SCORED:
      stats.penaltiesScored++;
      break;
    case MatchEventType.PENALTY_MISSED:
      stats.penaltiesMissed++;
      break;
    default:
      break;
  }
}

function mergeStoredTeamStats(target: TeamMatchStats, stored: TeamStatistics) {
  target.shots = Math.max(target.shots, stored.shots);
  target.shotsOn = Math.max(target.shotsOn, stored.shotsOn);
  target.corners = Math.max(target.corners, stored.corners);
  target.fouls = Math.max(target.fouls, stored.fouls);
  if (stored.possession != null) target.possession = stored.possession;
}

export function computeTeamStatsFromEvents(
  events: EventRow[],
  homeClubId: string,
  awayClubId: string,
  goals: { home: number; away: number },
  playerClubById: Map<string, string>,
  stored?: TeamStatistics[],
): { home: TeamMatchStats; away: TeamMatchStats } {
  const home = emptyTeamStats(homeClubId);
  const away = emptyTeamStats(awayClubId);
  home.goals = goals.home;
  away.goals = goals.away;

  for (const event of events) {
    const side = resolveEventSide(event, homeClubId, awayClubId, playerClubById);
    if (!side) continue;
    bumpTeamStat(side === 'home' ? home : away, event.type);
  }

  for (const row of stored ?? []) {
    const target =
      row.clubId === homeClubId ? home : row.clubId === awayClubId ? away : null;
    if (target) mergeStoredTeamStats(target, row);
  }

  return { home, away };
}

function bumpPlayerStat(stat: PlayerMatchStat, type: MatchEventType) {
  switch (type) {
    case MatchEventType.GOAL:
    case MatchEventType.PENALTY_SCORED:
      stat.goals++;
      break;
    case MatchEventType.OWN_GOAL:
      stat.ownGoals++;
      break;
    case MatchEventType.YELLOW_CARD:
      stat.yellowCards++;
      break;
    case MatchEventType.RED_CARD:
    case MatchEventType.SECOND_YELLOW:
      stat.redCards++;
      break;
    case MatchEventType.SHOT:
      stat.shots++;
      break;
    case MatchEventType.SHOT_ON_TARGET:
      stat.shots++;
      stat.shotsOn++;
      break;
    default:
      break;
  }
}

function lineupForClub(lineup: LineupRow[], clubId: string) {
  return lineup.filter((l) => l.clubId === clubId || l.player?.clubId === clubId);
}

function buildPlayerStatsForClub(
  events: EventRow[],
  lineup: LineupRow[],
  clubId: string,
): PlayerMatchStat[] {
  const map = new Map<string, PlayerMatchStat>();
  for (const slot of lineupForClub(lineup, clubId)) {
    if (!slot.player) continue;
    map.set(slot.playerId, {
      playerId: slot.playerId,
      firstName: slot.player.firstName,
      lastName: slot.player.lastName,
      isStarter: slot.isStarter,
      goals: 0,
      ownGoals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 0,
      shotsOn: 0,
    });
  }

  for (const event of events) {
    if (!event.playerId) continue;
    const stat = map.get(event.playerId);
    if (!stat) continue;
    bumpPlayerStat(stat, event.type);
  }

  for (const event of events) {
    if (!event.relatedPlayerId) continue;
    if (event.type !== MatchEventType.GOAL && event.type !== MatchEventType.PENALTY_SCORED) continue;
    const stat = map.get(event.relatedPlayerId);
    if (stat) stat.assists++;
  }

  return [...map.values()].sort(
    (a, b) => b.goals - a.goals || a.lastName.localeCompare(b.lastName),
  );
}

export function computePlayerMatchStats(
  events: EventRow[],
  lineup: LineupRow[],
  homeClubId: string,
  awayClubId: string,
): { home: PlayerMatchStat[]; away: PlayerMatchStat[] } {
  return {
    home: buildPlayerStatsForClub(events, lineup, homeClubId),
    away: buildPlayerStatsForClub(events, lineup, awayClubId),
  };
}

export function teamStatsToPersistence(stats: TeamMatchStats) {
  return {
    shots: stats.shots,
    shotsOn: stats.shotsOn,
    corners: stats.corners,
    fouls: stats.fouls,
    possession: stats.possession,
  };
}
