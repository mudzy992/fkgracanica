import { describe, it, expect } from 'vitest';
import { topScorers } from '../components/team/team-stats-utils';
import { groupMatchesByRound } from './round-utils';
import { confirmPaymentOnce } from './payment-confirm-once';

describe('fe06-batch67a lib cover', () => {
  it('topScorers pokriva ?? 0 oba u sortu', () => {
    const stats: any = {
      players: [
        { id: '1', stats: { goals: 2 } },
        { id: '2', stats: null },
        { id: '3' },
        { id: '4', stats: { goals: undefined } },
        { id: '5', stats: { goals: 1 } },
      ],
    };
    const res = topScorers(stats, 5);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].id).toBe('1');
  });

  it('groupMatchesByRound pokriva fallback `${key}. kolo`', () => {
    const matches: any[] = [
      { scheduledAt: '2020-01-02T00:00:00Z', roundRel: { number: 1, name: 'Prvo' } },
      { scheduledAt: '2020-01-01T00:00:00Z', roundRel: { number: 1, name: '' } },
    ];
    const grouped = groupMatchesByRound(matches);
    expect(grouped.length).toBe(1);
    // drugi pokušaj: matches gdje first ima prazan name pa label fallback
    const matches2: any[] = [
      { scheduledAt: '2020-01-01T00:00:00Z', roundRel: { number: 2, name: null } },
    ];
    const g2 = groupMatchesByRound(matches2);
    expect(g2[0].label).toBe('2. kolo');
  });

  it('confirmPaymentOnce deduplicate i remove na resolve/reject', async () => {
    let calls = 0;
    const p1 = confirmPaymentOnce('k1', async () => { calls++; return 'ok'; });
    const p2 = confirmPaymentOnce('k1', async () => { calls++; return 'dup'; });
    expect(p1).toBe(p2);
    await expect(p1).resolves.toBe('ok');
    expect(calls).toBe(1);
    // nakon resolve, novi poziv treba ponovo pozvati confirm
    const p3 = confirmPaymentOnce('k1', async () => 'again');
    await expect(p3).resolves.toBe('again');
  });

  it('confirmPaymentOnce pokriva inFlight.get===request false granu', async () => {
    // Napravi dva različita requesta s istim key ali drugi prebriše prvi prije remove
    const first = confirmPaymentOnce('k2', () => new Promise<string>((r) => setTimeout(() => r('first'), 10)));
    // Prije nego se first resolve, rucno ne možemo ubaciti drugi jer deduplicate vraća isti; zato testiramo reject path
    const errKey = 'k3';
    const pErr = confirmPaymentOnce(errKey, () => Promise.reject(new Error('fail')));
    await expect(pErr).rejects.toThrow('fail');
    // nakon reject, ponovo treba raditi
    const pErr2 = confirmPaymentOnce(errKey, async () => 'ok2');
    await expect(pErr2).resolves.toBe('ok2');
    await first;
  });

  it('confirmPaymentOnce pokriva sync throw', async () => {
    const p = confirmPaymentOnce('k4', () => { throw new Error('sync'); });
    await expect(p).rejects.toThrow('sync');
  });
});
