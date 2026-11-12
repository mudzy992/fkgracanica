import { describe, it, expect, vi } from 'vitest';
import { confirmPaymentOnce } from './payment-confirm-once';
import { groupMatchesByRound } from './round-utils';

describe('batch66g lib', () => {
  it('seo-meta window undefined', async () => {
    const originalWindow = globalThis.window;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = undefined;
    vi.resetModules();
    const mod = await import('./seo-meta');
    expect(mod.siteOrigin()).toBe('https://fkgracanica.ba');
    expect(mod.absoluteUrl('/a')).toContain('https://fkgracanica.ba/a');
    // restore
    (globalThis as any).window = originalWindow;
    vi.resetModules();
    const mod2 = await import('./seo-meta');
    expect(mod2.siteOrigin()).toBeDefined();
  });

  it('payment-confirm-once pokriva oba kraka', async () => {
    const key = 'g-' + Date.now() + Math.random();
    const fn = vi.fn(() => Promise.resolve('ok'));
    const a = confirmPaymentOnce(key, fn);
    // second simultaneous should hit existing
    const b = confirmPaymentOnce(key, fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    await a;
    await b;
    // after resolved, new call with same key should be fresh (false)
    const c = confirmPaymentOnce(key, () => Promise.resolve('again'));
    await expect(c).resolves.toBe('again');
    // different key
    const d = confirmPaymentOnce(key + '-2', () => Promise.resolve('diff'));
    await expect(d).resolves.toBe('diff');
  });

  it('round-utils groupMatchesByRound pokriva label fallback', () => {
    // roundRel with name null should still be truthy for items[0]?.roundRel, but label fallback is dead?
    // We try with roundRel null but with number via key - but n==null skips, so not.
    // Instead, test with roundRel having name undefined to hit roundLabel fallback
    const withName = groupMatchesByRound([
      { roundRel: { number: 1, name: 'Prvo' }, scheduledAt: '2026-01-01T00:00:00Z' },
    ] as never);
    expect(withName[0].label).toBe('Prvo');
    const withoutName = groupMatchesByRound([
      { roundRel: { number: 2, name: null }, scheduledAt: '2026-01-01T00:00:00Z' },
    ] as never);
    expect(withoutName[0].label).toBe('2. kolo');
    const withoutRelButWithNumber = groupMatchesByRound([
      { roundRel: { number: 3 } as never, scheduledAt: '2026-01-01T00:00:00Z' },
    ] as never);
    expect(withoutRelButWithNumber[0].label).toBe('3. kolo');
  });
});
