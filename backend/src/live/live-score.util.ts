import { MatchEventType } from '@prisma/client';

export type TeamSide = 'home' | 'away';

const SCORING: MatchEventType[] = ['GOAL', 'PENALTY_SCORED', 'OWN_GOAL'];

export function isScoringEvent(type: MatchEventType): boolean {
  return SCORING.includes(type);
}

export function applyScore(
  homeScore: number,
  awayScore: number,
  type: MatchEventType,
  teamSide?: string | null,
): { homeScore: number; awayScore: number } {
  const side: TeamSide = teamSide === 'away' ? 'away' : 'home';
  if (type === 'OWN_GOAL') {
    return side === 'home'
      ? { homeScore, awayScore: awayScore + 1 }
      : { homeScore: homeScore + 1, awayScore };
  }
  if (side === 'home') return { homeScore: homeScore + 1, awayScore };
  return { homeScore, awayScore: awayScore + 1 };
}
