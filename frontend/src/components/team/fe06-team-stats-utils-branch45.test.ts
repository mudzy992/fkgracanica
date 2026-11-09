import { describe, expect, it } from 'vitest';
import { squadCounts, topScorers, formationLabel, statsByPlayerId } from './team-stats-utils';

describe('team-stats-utils — branch45 (2 grane line 20)', () => {
  it('squadCounts starters vs bench vs empty', () => {
    expect(squadCounts([])).toEqual({ starters: 0, bench: 0, total: 0 });
    expect(
      squadCounts([
        { isBench: false, player: { id: 'p1' } },
        { isBench: true, player: { id: 'p2' } },
        { isBench: false, player: null },
        { isBench: true, player: undefined },
        { isBench: false, player: undefined },
      ]),
    ).toEqual({ starters: 1, bench: 1, total: 2 });
    // pokriva obje strane && za starters i bench
    expect(
      squadCounts([
        { isBench: false, player: { id: 'a' } },
        { isBench: false, player: { id: 'b' } },
      ]),
    ).toEqual({ starters: 2, bench: 0, total: 2 });
  });

  it('topScorers i formationLabel fallback', () => {
    expect(formationLabel(null)).toBeNull();
    expect(formationLabel({ def: 4, mid: 3, fwd: 3 })).toBe('4-3-3');
    expect(topScorers(undefined)).toEqual([]);
    expect(statsByPlayerId(undefined).size).toBe(0);
    // pokriva ?? 0 fallback za goals (b.stats?.goals ?? 0 i a.stats?.goals ?? 0)
    const stats = {
      players: [
        { id: 'p1', stats: { goals: 5 } },
        { id: 'p2', stats: undefined },
        { id: 'p3', stats: { goals: undefined } },
        { id: 'p4', stats: { goals: 0 } },
        { id: 'p5', stats: { goals: 2 } },
      ],
    } as never;
    const res = topScorers(stats, 10);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].id).toBe('p1');
    // statsByPlayerId sa stats null i sa stats praznim
    expect(statsByPlayerId({ players: [{ id: 'x', stats: null } as never] } as never).size).toBe(0);
    expect(statsByPlayerId({ players: [{ id: 'y', stats: { a: 1 } } as never] } as never).size).toBe(1);
  });
});
