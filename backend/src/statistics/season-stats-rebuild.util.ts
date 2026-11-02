import { MatchEventType, type MatchEvent } from '@prisma/client';

export type PlayerSeasonAgg = {
  playerId: string;
  appearances: number;
  goals: number;
  ownGoals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
};

function emptyAgg(playerId: string): PlayerSeasonAgg {
  return {
    playerId,
    appearances: 0,
    goals: 0,
    ownGoals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    minutes: 0,
  };
}

export function aggregatePlayerStatsFromMatch(
  events: Pick<MatchEvent, 'type' | 'playerId' | 'relatedPlayerId'>[],
): Map<string, PlayerSeasonAgg> {
  const byPlayer = new Map<string, PlayerSeasonAgg>();
  const playerIds = new Set<string>();
  for (const e of events) {
    if (e.playerId) playerIds.add(e.playerId);
    if (e.relatedPlayerId) playerIds.add(e.relatedPlayerId);
  }

  for (const playerId of playerIds) {
    const row = emptyAgg(playerId);
    const primary = events.filter((e) => e.playerId === playerId);
    row.goals = primary.filter((e) =>
      (['GOAL', 'PENALTY_SCORED'] as const).includes(
        e.type as 'GOAL' | 'PENALTY_SCORED',
      ),
    ).length;
    row.ownGoals = primary.filter(
      (e) => e.type === MatchEventType.OWN_GOAL,
    ).length;
    row.assists = events.filter(
      (e) =>
        e.relatedPlayerId === playerId &&
        (e.type === MatchEventType.GOAL ||
          e.type === MatchEventType.PENALTY_SCORED),
    ).length;
    row.yellowCards = primary.filter(
      (e) => e.type === MatchEventType.YELLOW_CARD,
    ).length;
    row.redCards = primary.filter((e) =>
      (['RED_CARD', 'SECOND_YELLOW'] as const).includes(
        e.type as 'RED_CARD' | 'SECOND_YELLOW',
      ),
    ).length;
    if (primary.length > 0 || row.assists > 0) {
      row.appearances = 1;
      row.minutes = 90;
    }
    byPlayer.set(playerId, row);
  }
  return byPlayer;
}

export function mergePlayerSeasonAggs(
  target: Map<string, PlayerSeasonAgg>,
  matchAgg: Map<string, PlayerSeasonAgg>,
) {
  for (const [playerId, row] of matchAgg) {
    const existing = target.get(playerId) ?? emptyAgg(playerId);
    target.set(playerId, {
      playerId,
      appearances: existing.appearances + row.appearances,
      goals: existing.goals + row.goals,
      ownGoals: existing.ownGoals + row.ownGoals,
      assists: existing.assists + row.assists,
      yellowCards: existing.yellowCards + row.yellowCards,
      redCards: existing.redCards + row.redCards,
      minutes: existing.minutes + row.minutes,
    });
  }
}
