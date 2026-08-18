import { MatchEventType } from '@prisma/client';

const PLAYER_REQUIRED = new Set<MatchEventType>([
  MatchEventType.GOAL,
  MatchEventType.OWN_GOAL,
  MatchEventType.PENALTY_SCORED,
  MatchEventType.PENALTY_MISSED,
  MatchEventType.YELLOW_CARD,
  MatchEventType.RED_CARD,
  MatchEventType.SECOND_YELLOW,
  MatchEventType.SUBSTITUTION,
  MatchEventType.INJURY,
  MatchEventType.SHOT,
  MatchEventType.SHOT_ON_TARGET,
  MatchEventType.SAVE,
  MatchEventType.FOUL,
  MatchEventType.CORNER,
  MatchEventType.OFFSIDE,
  MatchEventType.FREE_KICK,
]);

export function requiresClubPlayer(type: MatchEventType): boolean {
  return PLAYER_REQUIRED.has(type);
}

export function requiresRelatedPlayer(type: MatchEventType): boolean {
  return type === MatchEventType.SUBSTITUTION;
}
