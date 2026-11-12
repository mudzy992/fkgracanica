import { describe, it, expect } from 'vitest';
import { topScorers, spotlightPlayers, statsByPlayerId, squadCounts } from '../components/team/team-stats-utils';
import { confirmPaymentOnce } from './payment-confirm-once';
import { groupMatchesByRound, roundLabel } from './round-utils';

describe('batch66q lib branches', () => {
  it('team-stats-utils pokriva', () => {
    expect(topScorers(undefined)).toEqual([]);
    expect(topScorers({ players: [] } as never)).toEqual([]);
    expect(topScorers({ players: [{ id: '1', stats: null }] } as never)).toEqual([]);
    expect(topScorers({ players: [{ id: '1', stats: { goals: 1 } }] } as never).length).toBe(1);
    expect(spotlightPlayers(undefined, [])).toEqual([]);
    expect(spotlightPlayers({ players: [{ id: '1', stats: { goals: 1 } }] } as never, [{ id: '1' } as never])).toEqual([{ id: '1' }]);
    expect(statsByPlayerId(undefined).size).toBe(0);
    expect(statsByPlayerId({ players: [{ id: '1', stats: { goals: 1 } }] } as never).size).toBe(1);
    expect(squadCounts([{ isBench: false, player: { id: '1' } }, { isBench: true, player: null }]).total).toBe(1);
  });
  it('payment-confirm-once pokriva', async () => {
    const r1 = await confirmPaymentOnce('q-1', () => Promise.resolve(1));
    expect(r1).toBe(1);
    const p1 = confirmPaymentOnce('q-2', () => new Promise((res) => setTimeout(() => res(2), 10)));
    const p2 = confirmPaymentOnce('q-2', () => Promise.resolve(99));
    expect(p1).toBe(p2);
    await p1;
    const r3 = await confirmPaymentOnce('q-3', () => {
      throw new Error('fail');
    }).catch((e) => (e as Error).message);
    expect(r3).toBe('fail');
  });
  it('round-utils pokriva', () => {
    expect(roundLabel({ number: 1, name: '  Final  ' })).toBe('Final');
    expect(roundLabel({ number: 2, name: '' })).toBe('2. kolo');
    expect(groupMatchesByRound([{ roundRel: null, scheduledAt: '2024-01-01' } as never]).length).toBe(0);
    const g = groupMatchesByRound([
      { roundRel: { number: 1, name: null }, scheduledAt: '2024-01-02' },
      { roundRel: { number: 1, name: null }, scheduledAt: '2024-01-01' },
    ] as never);
    expect(g[0].label).toBe('1. kolo');
    const g2 = groupMatchesByRound([
      { roundRel: { number: 2, name: 'Polufinale' }, scheduledAt: '2024-01-01' },
    ] as never);
    expect(g2[0].label).toBe('Polufinale');
  });
  it('other libs', () => {
    expect(roundLabel({ number: 5, name: null })).toBe('5. kolo');
  });
});
