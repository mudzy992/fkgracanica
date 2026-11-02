import { MatchEventType } from '@prisma/client';
import {
  aggregatePlayerStatsFromMatch,
  mergePlayerSeasonAggs,
} from './season-stats-rebuild.util';

describe('season-stats-rebuild.util', () => {
  it('aggregates and merges player stats across matches', () => {
    const m1 = aggregatePlayerStatsFromMatch([
      { type: MatchEventType.GOAL, playerId: 'p1', relatedPlayerId: 'p2' },
      {
        type: MatchEventType.YELLOW_CARD,
        playerId: 'p2',
        relatedPlayerId: null,
      },
    ]);
    expect(m1.get('p1')?.goals).toBe(1);
    expect(m1.get('p2')?.assists).toBe(1);

    const season = new Map<
      string,
      ReturnType<typeof aggregatePlayerStatsFromMatch> extends Map<
        string,
        infer V
      >
        ? V
        : never
    >();
    mergePlayerSeasonAggs(season, m1);
    const m2 = aggregatePlayerStatsFromMatch([
      { type: MatchEventType.GOAL, playerId: 'p1', relatedPlayerId: null },
    ]);
    mergePlayerSeasonAggs(season, m2);
    expect(season.get('p1')?.goals).toBe(2);
    expect(season.get('p1')?.appearances).toBe(2);
  });
});
