import { StrictMode, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTicketPaymentReturn } from './use-ticket-payment-return';
import { useSeasonPassPaymentReturn } from './use-season-pass-payment-return';
import { useMembershipPaymentReturn } from './use-membership-payment-return';
import { isPaymentSessionConfirmed } from '../lib/payment-session';

const apiMock = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../lib/api', () => ({ api: apiMock }));

const options = { paid: true, enabled: true, sessionId: 'fixture', userId: 'user-1', provider: 'stripe' as const };
const cases = [
  { kind: 'tickets' as const, hook: useTicketPaymentReturn, endpoint: '/payments/tickets/confirm-session', key: ['ticketing', 'orders'], active: 'paid' },
  { kind: 'season' as const, hook: useSeasonPassPaymentReturn, endpoint: '/payments/season-pass/confirm-session', key: ['ticketing', 'season-pass'], active: 'ACTIVE' },
  { kind: 'membership' as const, hook: useMembershipPaymentReturn, endpoint: '/payments/membership/confirm-session', key: ['membership', 'me'], active: 'ACTIVE' },
];

describe('wrappers potvrde plaćanja', () => {
  beforeEach(() => { sessionStorage.clear(); apiMock.post.mockReset(); });
  afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); });

  it.each(cases)('$kind poziva pravilan endpoint jednom, invalidira i markira samo aktivan status', async ({ kind, hook, endpoint, key, active }) => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidation = vi.spyOn(qc, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => <StrictMode><QueryClientProvider client={qc}>{children}</QueryClientProvider></StrictMode>;
    apiMock.post.mockResolvedValue({ data: { status: active } });
    const result = renderHook(() => hook(options), { wrapper });
    await waitFor(() => expect(result.result.current.status).toBe('activated'));
    expect(apiMock.post).toHaveBeenCalledTimes(1);
    expect(apiMock.post).toHaveBeenCalledWith(endpoint, {
      sessionId: 'fixture', provider: 'stripe', returnUrl: window.location.href,
    });
    expect(invalidation).toHaveBeenCalledWith({ queryKey: key });
    expect(isPaymentSessionConfirmed({ kind, sessionId: 'fixture', userId: 'user-1', provider: 'stripe' })).toBe(true);
  });

  it.each(cases)('$kind ne tretira neaktivni odgovor kao potvrdu', async ({ kind, hook }) => {
    const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    apiMock.post.mockResolvedValue({ data: { status: 'PENDING' } });
    const result = renderHook(() => hook(options), { wrapper });
    await waitFor(() => expect(result.result.current.status).toBe('pending'));
    expect(result.result.current.activated).toBe(false);
    expect(isPaymentSessionConfirmed({ kind, sessionId: 'fixture', userId: 'user-1', provider: 'stripe' })).toBe(false);
  });
});
