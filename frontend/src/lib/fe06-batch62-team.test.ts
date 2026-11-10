import { describe, expect, it } from 'vitest';
import { topScorers } from '../components/team/team-stats-utils';

describe('batch62 team-stats-utils sort fallback', () => {
  it('goals undefined -> fallback 0', () => {
    const stats: any = {
      players: [
        { id: 'p1', stats: { goals: undefined } },
        { id: 'p2', stats: { goals: 2 } },
        { id: 'p3', stats: null },
      ],
    };
    const res = topScorers(stats, 10);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('p2');
  });
  it('both undefined sort', () => {
    const stats: any = {
      players: [
        { id: 'p1', stats: { goals: undefined } },
        { id: 'p2', stats: { goals: undefined } },
      ],
    };
    const res = topScorers(stats, 10);
    expect(res.length).toBe(0);
  });
});
