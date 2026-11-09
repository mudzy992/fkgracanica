import { describe, expect, it, vi } from 'vitest';
import { confirmPaymentOnce } from './payment-confirm-once';
import { paymentSessionKey, isPaymentSessionConfirmed, markPaymentSessionConfirmed } from './payment-session';
import { roundLabel, matchRoundNumber, matchRoundLabel, groupMatchesByRound } from './round-utils';
import { absoluteUrl, buildDocumentTitle, truncateMeta, resolveSeoMeta, siteOrigin } from './seo-meta';
import { settingLabel, settingDescription } from './settings-labels';
import { groupSponsorsByTier } from './sponsor-tiers';
import { pickFeaturedTrophy, splitFeaturedTrophy } from './trophy-utils';

describe('lib misc2 — branch45b (9×1)', () => {
  it('payment-confirm-once dedup i error', async () => {
    let calls = 0;
    const fn = () => { calls++; return Promise.resolve('ok'); };
    const p1 = confirmPaymentOnce('k1', fn);
    const p2 = confirmPaymentOnce('k1', fn);
    expect(p1).toBe(p2);
    await expect(p1).resolves.toBe('ok');
    expect(calls).toBe(1);
    const p3 = confirmPaymentOnce('k1', fn);
    expect(p3).not.toBe(p1);
    await p3;
    expect(calls).toBe(2);
    const errFn = () => { throw new Error('sync boom'); };
    await expect(confirmPaymentOnce('k2', errFn as never)).rejects.toThrow('sync boom');
    let pendingCalls = 0;
    const pendingFn = () => new Promise<string>((res) => setTimeout(() => { pendingCalls++; res('x'); }, 10));
    const pa = confirmPaymentOnce('k3', pendingFn);
    const pb = confirmPaymentOnce('k3', pendingFn);
    expect(pa).toBe(pb);
    await pa;
  });

  it('payment-session grane', () => {
    const s = { kind: 'tickets' as const, sessionId: 's1', userId: 'u1', provider: 'stripe' as never };
    expect(paymentSessionKey(s)).toContain('fk_confirm_v2');
    expect(paymentSessionKey({ kind: 'membership' as const, sessionId: 's2', userId: 'u2' } as never)).toContain('u2');
    markPaymentSessionConfirmed(s);
    expect(isPaymentSessionConfirmed(s)).toBe(true);
    expect(isPaymentSessionConfirmed({ kind: 'tickets' as const, sessionId: 'other', userId: 'u1' } as never)).toBe(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('fail'); });
    expect(isPaymentSessionConfirmed(s)).toBe(false);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('fail'); });
    expect(() => markPaymentSessionConfirmed(s)).not.toThrow();
    vi.restoreAllMocks();
  });

  it('round-utils grane', () => {
    expect(roundLabel({ number: 1, name: 'Finale' })).toBe('Finale');
    expect(roundLabel({ number: 2, name: '   ' })).toBe('2. kolo');
    expect(roundLabel({ number: 3 })).toBe('3. kolo');
    expect(matchRoundNumber({ roundRel: { number: 5, name: null } })).toBe(5);
    expect(matchRoundNumber({ roundRel: null })).toBeNull();
    expect(matchRoundLabel({ roundRel: { number: 1, name: 'F' } })).toBe('F');
    expect(matchRoundLabel({ roundRel: null })).toBeNull();
    const grouped = groupMatchesByRound([
      { roundRel: { number: 1, name: 'A' }, scheduledAt: '2026-01-02' } as never,
      { roundRel: { number: 1, name: 'A' }, scheduledAt: '2026-01-01' } as never,
      { roundRel: { number: 2, name: null }, scheduledAt: '2026-01-03' } as never,
      { scheduledAt: '2026-01-04' } as never,
    ] as never);
    expect(grouped).toHaveLength(2);
    expect(grouped[0].key).toBe(2);
  });

  it('seo-meta grane', () => {
    expect(siteOrigin()).toBeTruthy();
    expect(absoluteUrl('https://example.com/x')).toBe('https://example.com/x');
    expect(absoluteUrl('http://example.com/x')).toBe('http://example.com/x');
    expect(absoluteUrl('/a/b')).toContain('/a/b');
    expect(absoluteUrl('a/b')).toContain('/a/b');
    expect(buildDocumentTitle(undefined, 'FK')).toBe('FK');
    expect(buildDocumentTitle('   ', 'FK')).toBe('FK');
    expect(buildDocumentTitle('FK', 'FK')).toBe('FK');
    expect(buildDocumentTitle('Naslov', 'FK')).toBe('Naslov | FK');
    expect(truncateMeta('a'.repeat(200), 10).length).toBeLessThanOrEqual(10);
    expect(truncateMeta('kratko')).toBe('kratko');
    const seo = resolveSeoMeta({ siteName: '  ', title: '  ', description: '<p>hi</p>', defaultDescription: 'def', url: '/x' });
    expect(seo.siteName).toBe('FK Gračanica');
    expect(seo.description).toContain('hi');
    const seo2 = resolveSeoMeta({ siteName: 'FK', title: 'T', description: undefined, defaultDescription: 'def2', image: 'img.jpg', defaultImage: 'def.jpg', url: 'https://a.com', type: 'article' });
    expect(seo2.image).toBe('img.jpg');
    expect(seo2.type).toBe('article');
  });

  it('settings-labels grane', () => {
    expect(settingLabel('club.name')).toBe('Naziv kluba');
    expect(settingLabel('unknown.key')).toBe('unknown.key');
    expect(settingDescription('club.name')).toBeTruthy();
    expect(settingDescription('unknown.key')).toBeUndefined();
  });

  it('sponsor-tiers grane', () => {
    const grouped = groupSponsorsByTier([{ tier: 'GENERAL', id: '1' } as never, { tier: 'UNKNOWN_TIER', id: '2' } as never, { tier: 'GOLD', id: '3' } as never]);
    expect(grouped.some((g) => g.tier === 'PARTNER')).toBe(true);
    expect(groupSponsorsByTier([])).toEqual([]);
  });

  it('trophy-utils grane', () => {
    expect(pickFeaturedTrophy([])).toBeNull();
    expect(pickFeaturedTrophy([{ id: '1', featured: true } as never, { id: '2' } as never])?.id).toBe('1');
    expect(pickFeaturedTrophy([{ id: '1', imagePath: 'a', description: 'd' } as never, { id: '2' } as never])?.id).toBe('1');
    expect(pickFeaturedTrophy([{ id: '1' } as never, { id: '2' } as never])?.id).toBe('1');
    const split = splitFeaturedTrophy([{ id: '1', featured: true } as never, { id: '2' } as never]);
    expect(split.featured?.id).toBe('1');
    expect(split.rest).toHaveLength(1);
    const splitEmpty = splitFeaturedTrophy([]);
    expect(splitEmpty.featured).toBeNull();
  });
});
