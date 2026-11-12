import { describe, it, expect } from 'vitest';
import { topScorers, statsByPlayerId, squadCounts } from './team-stats-utils';

describe('fe06 team-stats-utils branch52', () => {
  it('topScorers undefined stats → [] fallback', () => {
    expect(topScorers(undefined)).toEqual([]);
  });
  it('statsByPlayerId undefined → empty map', () => {
    const m = statsByPlayerId(undefined);
    expect(m.size).toBe(0);
  });
  it('topScorers with players but no goals → []', () => {
    const stats = { players: [{ id: 'p1', stats: { goals: 0 } }, { id: 'p2', stats: null }] } as never;
    expect(topScorers(stats)).toEqual([]);
  });
  it('squadCounts empty slots', () => {
    expect(squadCounts([])).toEqual({ starters: 0, bench: 0, total: 0 });
  });
});
