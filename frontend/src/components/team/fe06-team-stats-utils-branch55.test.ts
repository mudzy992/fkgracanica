import { describe, it, expect } from 'vitest';
import { topScorers } from './team-stats-utils';

describe('fe06 team-stats-utils branch55 - sort ?? 0', () => {
  it('b.stats undefined → ?? 0 fallback', () => {
    const stats = {
      players: [
        { id: 'p1', stats: { goals: 2 } },
        { id: 'p2', stats: undefined as any },
        { id: 'p3', stats: { goals: undefined as any } },
      ],
    } as any;
    const res = topScorers(stats, 3);
    // should handle undefined goals without throwing, using ?? 0
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('p1');
  });
  it('both a and b undefined goals → sort fallback both', () => {
    const stats = {
      players: [
        { id: 'p1', stats: undefined as any },
        { id: 'p2', stats: undefined as any },
      ],
    } as any;
    const res = topScorers(stats);
    expect(res.length).toBe(0);
  });
  it('covers a.stats ?? and b change order', () => {
    const stats = {
      players: [
        { id: 'p1', stats: { goals: 0 } },
        { id: 'p2', stats: { goals: 1 } },
        { id: 'p3', stats: undefined as any },
      ],
    } as any;
    const res = topScorers(stats, 2);
    expect(res[0].id).toBe('p2');
  });
});
