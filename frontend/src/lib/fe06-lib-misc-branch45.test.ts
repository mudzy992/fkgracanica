import { describe, expect, it, vi } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { clubShortName } from './club-display-name';
import { contentStatusLabel } from './content-status-labels';
import { matchEventLabel } from './match-event-labels';
import { buildFormationSlots, validPitchCoordinates, asPlayerPosition } from './formation-slots';
import { groupTicketsByMatch } from './group-tickets-by-match';
import { normalizeHtmlForRender, stripHtml } from './html-content';
import { mediaUrl, galleryPreviewUrl } from './media';
import { isModuleEnabled, getModuleToggleBlockReason } from './module-settings-rules';
import { confirmPaymentOnce } from './payment-confirm-once';
import { paymentSessionKey, isPaymentSessionConfirmed, markPaymentSessionConfirmed } from './payment-session';
import { roundLabel, matchRoundNumber, matchRoundLabel, groupMatchesByRound } from './round-utils';
import { absoluteUrl, buildDocumentTitle, truncateMeta, resolveSeoMeta, siteOrigin } from './seo-meta';
import { settingLabel, settingDescription } from './settings-labels';
import { groupSponsorsByTier } from './sponsor-tiers';
import { pickFeaturedTrophy, splitFeaturedTrophy } from './trophy-utils';

describe('lib misc — branch45 (17x1 + više)', () => {
  it('getApiErrorMessage sve grane', () => {
    // string
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: 'Zauzeto' } } } as unknown, 'fb')).toBe('Zauzeto');
    // array
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: ['a', 'b'] } } } as unknown, 'fb')).toBe('a, b');
    // isAxiosError true ali message nije string/array -> fallback na Error / fallback
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: 123 } } } as unknown, 'fb')).toBe('fb');
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: {} } } as unknown, 'fb')).toBe('fb');
    expect(getApiErrorMessage({ isAxiosError: true, response: undefined } as unknown, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error('oops'), 'fb')).toBe('oops');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
  });

  it('clubShortName fallback i trim', () => {
    expect(clubShortName({ name: 'FK Gračanica', shortName: 'GRA' } as never)).toBe('GRA');
    expect(clubShortName({ name: 'FK Gračanica' } as never)).toBe('FK');
    expect(clubShortName({ name: '   ' } as never)).toBe('');
    expect(clubShortName(null)).toBe('?');
    expect(clubShortName(undefined)).toBe('?');
    expect(clubShortName({ name: 'A' } as never, 10)).toBe('A');
  });

  it('contentStatusLabel i matchEventLabel fallback', () => {
    expect(contentStatusLabel('DRAFT')).toBe('Nacrt');
    expect(contentStatusLabel('UNKNOWN_X')).toBe('UNKNOWN_X');
    expect(matchEventLabel('GOAL')).toBe('Gol');
    expect(matchEventLabel('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE');
  });

  it('formation-slots grane', () => {
    expect(validPitchCoordinates(50, 50)).toBe(true);
    expect(validPitchCoordinates(null, 50)).toBe(false);
    expect(validPitchCoordinates(101, 50)).toBe(false);
    expect(validPitchCoordinates(50, -1)).toBe(false);
    expect(asPlayerPosition('GK')).toBe('GK');
    expect(asPlayerPosition('UNKNOWN')).toBeUndefined();
    expect(asPlayerPosition(null)).toBeUndefined();
    // preferredSlotIndex true branch
    const slots = buildFormationSlots(
      [{ playerId: 'p1', preferredSlotIndex: 0, role: 'GK' as never }],
    );
    expect(slots[0].playerId).toBe('p1');
    // role fallback i validPitchCoordinates true
    const slots2 = buildFormationSlots(
      [{ playerId: 'p2', role: 'FWD' as never, positionX: 10, positionY: 10 }],
    );
    expect(slots2.some((s) => s.playerId === 'p2')).toBe(true);
    // bez ičega
    expect(buildFormationSlots([])).toHaveLength(11);
  });

  it('groupTicketsByMatch sve grane', () => {
    expect(groupTicketsByMatch([])).toEqual([]);
    // matchId direktno
    const g1 = groupTicketsByMatch([
      { tickets: [{ matchId: 'm1', id: 't1', match: { id: 'm1', scheduledAt: '2026-01-01' } as never } as never] } as never,
    ]);
    expect(g1).toHaveLength(1);
    expect(g1[0].matchId).toBe('m1');
    // fallback na match.id
    const g2 = groupTicketsByMatch([
      { tickets: [{ match: { id: 'm2', scheduledAt: '2026-01-02' } as never, id: 't2' } as never] } as never,
    ]);
    expect(g2[0].matchId).toBe('m2');
    // unknown fallback
    const g3 = groupTicketsByMatch([
      { tickets: [{ id: 't3' } as never] } as never,
    ]);
    expect(g3[0].matchId).toBe('unknown');
    // grupisanje više ticketa istog meča
    const g4 = groupTicketsByMatch([
      { tickets: [{ matchId: 'm1', id: 't1' } as never] } as never,
      { tickets: [{ matchId: 'm1', id: 't2' } as never] } as never,
    ]);
    expect(g4).toHaveLength(1);
    expect(g4[0].items).toHaveLength(2);
  });

  it('html-content normalize i strip', () => {
    expect(normalizeHtmlForRender('')).toBe('');
    expect(normalizeHtmlForRender('   ')).toBe('');
    expect(normalizeHtmlForRender('<p>hi</p>')).toBe('<p>hi</p>');
    expect(normalizeHtmlForRender('&lt;p&gt;hi&lt;/p&gt;')).toBe('<p>hi</p>');
    // iframe sa textContent null -> ?? ''
    const docHtml = '<div><iframe>hello</iframe><p>hi</p></div>';
    expect(normalizeHtmlForRender(docHtml)).toContain('hi');
    expect(stripHtml('')).toBe('');
    expect(stripHtml('<p>hi <b>there</b></p>')).toContain('hi');
    expect(stripHtml('&lt;p&gt;hi&lt;/p&gt;')).toContain('hi');
  });

  it('media url grane', () => {
    expect(mediaUrl(undefined)).toBeUndefined();
    expect(mediaUrl('')).toBeUndefined();
    expect(mediaUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(mediaUrl('http://example.com/b.jpg')).toBe('http://example.com/b.jpg');
    expect(mediaUrl('originals/foo/bar.jpg', 'thumb')).toContain('thumbs/foo/bar.webp');
    expect(mediaUrl('uploads/foo.jpg', 'medium')).toContain('foo.jpg');
    expect(mediaUrl('./uploads/foo.jpg')).toContain('foo.jpg');
    expect(mediaUrl('some/path.jpg', 'original')).toContain('some/path.jpg');
    expect(galleryPreviewUrl('a.jpg')).toBeTruthy();
    expect(galleryPreviewUrl(null)).toBeUndefined();
  });

  it('module-settings-rules grane', () => {
    expect(isModuleEnabled(undefined, 'modules.news')).toBe(true);
    expect(isModuleEnabled({ 'modules.news': 'false' }, 'modules.news')).toBe(false);
    expect(isModuleEnabled({ 'modules.news': 'true' }, 'modules.news')).toBe(true);
    expect(getModuleToggleBlockReason('nepostojeci', true, {})).toBeNull();
    // disable with dependent active
    expect(getModuleToggleBlockReason('modules.competitions', false, { 'feature.live': 'true' })).toContain('Isključite');
    expect(getModuleToggleBlockReason('modules.competitions', false, { 'feature.live': 'false' })).toBeNull();
    expect(getModuleToggleBlockReason('modules.competitions', false, {})).toContain('Isključite');
    // enable with missing requires
    expect(getModuleToggleBlockReason('feature.live', true, { 'modules.competitions': 'false' })).toContain('Uključite');
    expect(getModuleToggleBlockReason('feature.live', true, { 'modules.competitions': 'true' })).toBeNull();
    expect(getModuleToggleBlockReason('feature.live', true, {})).toBeNull();
  });

  it('payment-confirm-once dedup i error', async () => {
    let calls = 0;
    const fn = () => { calls++; return Promise.resolve('ok'); };
    const p1 = confirmPaymentOnce('k1', fn);
    const p2 = confirmPaymentOnce('k1', fn);
    expect(p1).toBe(p2);
    await expect(p1).resolves.toBe('ok');
    expect(calls).toBe(1);
    // nakon završetka, novi poziv opet poziva fn
    const p3 = confirmPaymentOnce('k1', fn);
    expect(p3).not.toBe(p1);
    await p3;
    expect(calls).toBe(2);
    // sync throw
    const errFn = () => { throw new Error('sync boom'); };
    await expect(confirmPaymentOnce('k2', errFn as never)).rejects.toThrow('sync boom');
    // isto ključ dok je pending vraća istu promis
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
    // storage ok
    markPaymentSessionConfirmed(s);
    expect(isPaymentSessionConfirmed(s)).toBe(true);
    // drugi session nije confirmed
    expect(isPaymentSessionConfirmed({ kind: 'tickets' as const, sessionId: 'other', userId: 'u1' } as never)).toBe(false);
    // storage error grana
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
      { scheduledAt: '2026-01-04' } as never, // without round -> skip
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
    const grouped = groupSponsorsByTier([
      { tier: 'GENERAL', id: '1' } as never,
      { tier: 'UNKNOWN_TIER', id: '2' } as never,
      { tier: 'GOLD', id: '3' } as never,
    ]);
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
