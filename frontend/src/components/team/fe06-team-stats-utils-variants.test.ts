import { describe, expect, it } from 'vitest';
import { formationLabel, squadCounts, statsByPlayerId, topScorers } from './team-stats-utils';

describe('team-stats-utils — varijante (2 grane)', () => {
  it('formationLabel null i sa vrijednosti', () => {
    expect(formationLabel(null)).toBeNull();
    expect(formationLabel(undefined)).toBeNull();
    expect(formationLabel({ def: 4, mid: 3, fwd: 3 })).toBe('4-3-3');
  });

  it('statsByPlayerId sa undefined koristi ?? []', () => {
    expect(statsByPlayerId(undefined).size).toBe(0);
    expect(statsByPlayerId({ players: [] } as never).size).toBe(0);
  });

  it('topScorers sa praznim koristi fallback', () => {
    expect(topScorers(undefined).length).toBe(0);
    expect(topScorers({ players: [{ id: 'p1', stats: { goals: 2 } }] } as never).length).toBe(1);
  });

  it('squadCounts starters i bench', () => {
    const slots = [{ isBench: false, player: {} }, { isBench: true, player: {} }, { isBench: false, player: null }];
    expect(squadCounts(slots as never)).toEqual({ starters: 1, bench: 1, total: 2 });
  });
});
