import { describe, expect, it } from 'vitest';
import { formationLabel, spotlightPlayers, squadCounts, statsByPlayerId, topScorers } from './team-stats-utils';
import type { ClubSeasonStats } from '../../types/club-hub';
import type { Player } from '../../types';

describe('team-stats-utils — branch49 (preostale grane formationLabel, statsByPlayerId, squadCounts)', () => {
  it('formationLabel nullish i valid', () => {
    expect(formationLabel(null)).toBeNull();
    expect(formationLabel(undefined)).toBeNull();
    expect(formationLabel({ def: 4, mid: 3, fwd: 3 })).toBe('4-3-3');
    expect(formationLabel({ def: 5, mid: 4, fwd: 1 })).toBe('5-4-1');
  });

  it('statsByPlayerId pokriva ?? [] i p.stats guard', () => {
    expect(statsByPlayerId(undefined).size).toBe(0);
    expect(statsByPlayerId(null as unknown as ClubSeasonStats).size).toBe(0);
    expect(statsByPlayerId({ players: [] } as unknown as ClubSeasonStats).size).toBe(0);
    const stats = {
      players: [
        { id: 'a', stats: { goals: 1 } as never },
        { id: 'b', stats: null as never },
        { id: 'c', stats: undefined as never },
        { id: 'd', stats: { goals: 2 } as never },
      ],
    } as unknown as ClubSeasonStats;
    const map = statsByPlayerId(stats);
    expect(map.size).toBe(2);
    expect(map.get('a')).toEqual({ goals: 1 });
    expect(map.get('d')).toEqual({ goals: 2 });
    expect(map.has('b')).toBe(false);
  });

  it('topScorers ?? [] i filter/sort fallbackovi', () => {
    expect(topScorers(undefined)).toEqual([]);
    expect(topScorers(null as unknown as ClubSeasonStats)).toEqual([]);
    const stats = {
      players: [
        { id: 'p1', stats: { goals: 5 } },
        { id: 'p2', stats: { goals: 0 } },
        { id: 'p3', stats: null as never },
        { id: 'p4', stats: undefined as never },
        { id: 'p5', stats: { goals: 2 } },
      ],
    } as unknown as ClubSeasonStats;
    const res = topScorers(stats, 10);
    expect(res.map((r) => r.id)).toEqual(['p1', 'p5']);
    // limit
    expect(topScorers(stats, 1).map((r) => r.id)).toEqual(['p1']);
    // default limit 3
    const stats2 = {
      players: [
        { id: 'a', stats: { goals: 1 } },
        { id: 'b', stats: { goals: 2 } },
        { id: 'c', stats: { goals: 3 } },
        { id: 'd', stats: { goals: 4 } },
      ],
    } as unknown as ClubSeasonStats;
    expect(topScorers(stats2).length).toBe(3);
  });

  it('squadCounts starters/bench/total', () => {
    expect(squadCounts([])).toEqual({ starters: 0, bench: 0, total: 0 });
    const slots = [
      { isBench: false, player: { id: '1' } },
      { isBench: false, player: null },
      { isBench: false, player: undefined },
      { isBench: true, player: { id: '2' } },
      { isBench: true, player: null },
      { isBench: false, player: { id: '3' } },
    ] as never;
    expect(squadCounts(slots)).toEqual({ starters: 2, bench: 1, total: 3 });
  });

  it('spotlightPlayers undefined i filter', () => {
    const roster = [
      { id: 'x', firstName: 'A', lastName: 'B' },
      { id: 'y', firstName: 'C', lastName: 'D' },
    ] as unknown as Player[];
    expect(spotlightPlayers(undefined, roster)).toEqual([]);
    expect(spotlightPlayers(null as unknown as ClubSeasonStats, roster)).toEqual([]);
    const stats = {
      players: [
        { id: 'x', stats: { goals: 5 } },
        { id: 'y', stats: { goals: 3 } },
        { id: 'z', stats: { goals: 1 } },
      ],
    } as unknown as ClubSeasonStats;
    const sp = spotlightPlayers(stats, roster);
    // z nema u rosteru, isfiltriran
    expect(sp.map((p) => p.id).sort()).toEqual(['x', 'y']);
  });
});
