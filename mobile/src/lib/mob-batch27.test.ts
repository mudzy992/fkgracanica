import { beforeEach, describe, expect, it, vi } from 'vitest';

(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;

vi.mock('react-native', () => ({
  Vibration: { vibrate: vi.fn() },
  Platform: { OS: 'ios' as const },
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

vi.mock('expo-linking', () => ({
  createURL: vi.fn(() => 'exp://payment-return'),
  parse: vi.fn((url: string) => {
    const u = new URL(url.replace('exp://', 'https://example.com/'));
    const params: Record<string, string> = {};
    u.searchParams.forEach((v, k) => (params[k] = v));
    return { queryParams: params };
  }),
}));

vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: vi.fn(async () => ({ type: 'success', url: 'exp://payment-return?session_id=sess123' })),
}));

vi.mock('../lib/api', () => ({
  API_URL: 'https://api.fkgracanica.ba101.top/api/v1',
  api: { get: vi.fn(async () => ({ data: [] })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) },
}));

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { api } from '../lib/api';
import { finishCheckoutReturn, parseCheckoutKind, startMobileCheckout } from '../lib/start-mobile-checkout';

const post = vi.mocked(api.post);
const openAuth = vi.mocked(WebBrowser.openAuthSessionAsync);
const createURL = vi.mocked(Linking.createURL);

describe('mob-batch27 — P-MOB27 start-mobile-checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    post.mockReset();
    openAuth.mockReset();
    createURL.mockReturnValue('exp://payment-return');
    post.mockResolvedValue({ data: { url: 'https://checkout.stripe.com/pay/xyz' } } as never);
    openAuth.mockResolvedValue({ type: 'success', url: 'exp://payment-return?session_id=sess123' } as never);
  });

  it('startMobileCheckout success paid', async () => {
    const res = await startMobileCheckout({ kind: 'tickets', body: { orderId: 'o1' } });
    expect(res).toBe('paid');
    expect(post).toHaveBeenCalledWith('/payments/checkout/tickets', expect.objectContaining({ provider: 'stripe' }));
    expect(openAuth).toHaveBeenCalled();
  });

  it('startMobileCheckout successUrl/cancelUrl bounce', async () => {
    await startMobileCheckout({ kind: 'membership', body: {} });
    const call = post.mock.calls[0][1] as Record<string, string>;
    expect(call.successUrl).toContain('kind=membership');
    expect(call.successUrl).toContain('paid=1');
    expect(call.cancelUrl).toContain('cancelled=1');
  });

  it('startMobileCheckout cancelled', async () => {
    openAuth.mockResolvedValue({ type: 'cancel' } as never);
    const res = await startMobileCheckout({ kind: 'tickets', body: {} });
    expect(res).toBe('cancelled');
  });

  it('startMobileCheckout dismissed', async () => {
    openAuth.mockResolvedValue({ type: 'dismiss' } as never);
    const res = await startMobileCheckout({ kind: 'season', body: {} });
    expect(res).toBe('dismissed');
  });

  it('startMobileCheckout throw bez url', async () => {
    post.mockResolvedValue({ data: {} } as never);
    await expect(startMobileCheckout({ kind: 'tickets', body: {} })).rejects.toThrow('checkout');
  });

  it('finishCheckoutReturn cancelled', async () => {
    const res = await finishCheckoutReturn('tickets', 'exp://payment-return?cancelled=1');
    expect(res).toBe('cancelled');
    expect(post).not.toHaveBeenCalled();
  });

  it('finishCheckoutReturn dismissed bez session', async () => {
    const res = await finishCheckoutReturn('tickets', 'exp://payment-return');
    expect(res).toBe('dismissed');
  });

  it('finishCheckoutReturn paid', async () => {
    post.mockResolvedValue({ data: {} } as never);
    const res = await finishCheckoutReturn('membership', 'exp://payment-return?session_id=abc');
    expect(res).toBe('paid');
    expect(post).toHaveBeenCalledWith('/payments/membership/confirm-session', { sessionId: 'abc', provider: 'stripe' });
  });

  it('parseCheckoutKind valid i fallback', () => {
    expect(parseCheckoutKind('tickets')).toBe('tickets');
    expect(parseCheckoutKind('membership')).toBe('membership');
    expect(parseCheckoutKind('season')).toBe('season');
    expect(parseCheckoutKind('nepoznato')).toBe('tickets');
    expect(parseCheckoutKind(undefined)).toBe('tickets');
  });

  it('startMobileCheckout season kind path', async () => {
    await startMobileCheckout({ kind: 'season', body: { id: 's1' } });
    expect(post).toHaveBeenCalledWith('/payments/checkout/season-pass', expect.any(Object));
  });

  it('finishCheckoutReturn array param', async () => {
    // Linking.parse returns array for duplicate keys? asParam handles array
    const LinkingMock = await import('expo-linking');
    vi.mocked(LinkingMock.parse).mockReturnValueOnce({ queryParams: { session_id: ['sess1', 'sess2'] } } as never);
    post.mockResolvedValue({ data: {} } as never);
    const res = await finishCheckoutReturn('tickets', 'exp://payment-return?session_id=sess1&session_id=sess2');
    expect(res).toBe('paid');
  });
});
