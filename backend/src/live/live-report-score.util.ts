import { MatchEventType } from '@prisma/client';
import { applyScore, isScoringEvent } from './live-score.util';

type ScoringEvent = {
  type: MatchEventType;
  teamSide: string | null;
};

export function recalculateScoreFromEvents(events: ScoringEvent[]) {
  let homeScore = 0;
  let awayScore = 0;
  for (const ev of events) {
    if (!isScoringEvent(ev.type)) continue;
    const next = applyScore(homeScore, awayScore, ev.type, ev.teamSide);
    homeScore = next.homeScore;
    awayScore = next.awayScore;
  }
  return { homeScore, awayScore };
}
