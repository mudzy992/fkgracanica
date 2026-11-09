import { describe, expect, it } from 'vitest';
import { topScorers, spotlightPlayers } from './team-stats-utils';
import type { ClubSeasonStats } from '../../types/club-hub';
import type { Player } from '../../types';

describe('team-stats-utils — branch48 (2 grane line 20 ?? 0)', () => {
  it('filter i sort fallback kada je goals nullish (bid6 i bid7)', () => {
    const stats = {
      players: [
        { id: 'p1', stats: { goals: 5 } },
        { id: 'p2', stats: null as unknown as { goals: number } },
        { id: 'p3', stats: {} as { goals: number } },
        { id: 'p4', stats: { goals: undefined } as unknown as { goals: number } },
        { id: 'p5', stats: { goals: null } as unknown as { goals: number } },
        { id: 'p6', stats: { goals: 0 } },
        { id: 'p7', stats: { goals: 2 } },
      ],
    } as unknown as ClubSeasonStats;
    const res = topScorers(stats, 10);
    // samo p1 i p7 imaju goals >0 nakon ??0
    expect(res.map((r) => r.id)).toEqual(['p1', 'p7']);
    expect(res.length).toBe(2);

    // sort da pokrije i b i a fallback: miješamo undefined i valid
    const stats2 = {
      players: [
        { id: 'a', stats: { goals: undefined } as unknown as { goals: number } },
        { id: 'b', stats: { goals: 3 } },
        { id: 'c', stats: undefined as unknown as { goals: number } },
        { id: 'd', stats: { goals: 1 } },
        { id: 'e', stats: null as unknown as { goals: number } },
      ],
    } as unknown as ClubSeasonStats;
    const res2 = topScorers(stats2, 10);
    // očekuje sortirano po goals silazno: b(3), d(1), ostali isfiltrirani
    expect(res2.map((r) => r.id)).toEqual(['b', 'd']);
  });

  it('spotlightPlayers koristi topScorers fallback i roster filter', () => {
    const stats = {
      players: [
        { id: 'x', stats: { goals: 4 } },
        { id: 'y', stats: { goals: undefined } as unknown as { goals: number } },
        { id: 'z', stats: { goals: 1 } },
      ],
    } as unknown as ClubSeasonStats;
    const roster = [
      { id: 'x', firstName: 'A', lastName: 'B' },
      { id: 'z', firstName: 'C', lastName: 'D' },
      { id: 'other', firstName: 'E', lastName: 'F' },
    ] as unknown as Player[];
    const sp = spotlightPlayers(stats, roster);
    // samo x i z prolaze filter, a roster sadrži oba
    expect(sp.map((p) => p.id).sort()).toEqual(['x', 'z']);
    // kada stats undefined, vraća prazno
    expect(spotlightPlayers(undefined, roster)).toEqual([]);
    expect(spotlightPlayers(null as unknown as ClubSeasonStats, roster)).toEqual([]);
  });

  it('stats?.players ?? [] fallback kada je stats undefined', () => {
    expect(topScorers(undefined)).toEqual([]);
    expect(topScorers(null as unknown as ClubSeasonStats)).toEqual([]);
    // i kada je players undefined implicitno
    expect(topScorers({} as unknown as ClubSeasonStats)).toEqual([]);
  });
});
