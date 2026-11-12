import { describe, expect, it } from 'vitest';
import type { Player } from '../../types';
import type { ClubSeasonStats } from '../../types/club-hub';
import {
  formationLabel,
  spotlightPlayers,
  squadCounts,
  statsByPlayerId,
  topScorers,
} from './team-stats-utils';

const statsOf = (goals: number, assists = 0, appearances = 0) => ({
  goals,
  assists,
  appearances,
  yellowCards: 0,
  redCards: 0,
  minutes: 0,
});

const stats: ClubSeasonStats = {
  season: { id: 's1', name: '2025/2026' },
  standing: null,
  totals: statsOf(0),
  players: [
    { id: 'p1', firstName: 'A', lastName: 'A', stats: statsOf(1, 2, 10) },
    { id: 'p2', firstName: 'B', lastName: 'B', stats: statsOf(3, 1, 8) },
    { id: 'p3', firstName: 'C', lastName: 'C', stats: null },
    { id: 'p4', firstName: 'D', lastName: 'D', stats: statsOf(3, 5, 9) },
  ],
};

describe('team-stats-utils', () => {
  it('formationLabel vraća null bez formacije i tekst sa brojevima', () => {
    expect(formationLabel(null)).toBeNull();
    expect(formationLabel({ def: 4, mid: 3, fwd: 3 })).toBe('4-3-3');
  });

  it('statsByPlayerId preskače igrače bez statistike', () => {
    const map = statsByPlayerId(stats);
    expect([...map.keys()]).toEqual(['p1', 'p2', 'p4']);
    expect(map.get('p2')?.goals).toBe(3);
    expect(statsByPlayerId(undefined).size).toBe(0);
  });

  it('topScorers filtrira igrače bez golova i sortira po golovima', () => {
    expect(topScorers(stats).map((p) => p.id)).toEqual(['p2', 'p4', 'p1']);
    expect(topScorers(stats, 1)).toHaveLength(1);
    expect(topScorers(undefined)).toEqual([]);
  });

  it('topScorers vraća praznu listu kad niko nema gol', () => {
    const noGoals: ClubSeasonStats = {
      ...stats,
      players: [{ id: 'x', firstName: 'X', lastName: 'X', stats: statsOf(0) }],
    };
    expect(topScorers(noGoals)).toEqual([]);
  });

  it('squadCounts broji samo slotove sa igračem', () => {
    expect(
      squadCounts([
        { isBench: false, player: { id: 'a' } },
        { isBench: false, player: null },
        { isBench: true, player: { id: 'b' } },
        { isBench: true, player: null },
      ]),
    ).toEqual({ starters: 1, bench: 1, total: 2 });
  });

  it('spotlightPlayers zadržava samo igrače koji postoje u rosteru', () => {
    const roster = [
      { id: 'p2', firstName: 'B', lastName: 'B' },
      { id: 'p1', firstName: 'A', lastName: 'A' },
    ] as Player[];
    expect(spotlightPlayers(stats, roster).map((p) => p.id)).toEqual(['p2', 'p1']);
    expect(spotlightPlayers(null, roster)).toEqual([]);
  });
});
