import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOnlineTicketCheckout, useOnlineMembershipCheckout, useOnlineSeasonPassCheckout } from './use-online-checkout';
import { useLiveClock } from './use-live-clock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const apiMock = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../lib/api', () => ({ api: apiMock }));

let qc: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

const setup = () => {
  qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
};
const ok = (data: unknown) => Promise.resolve({ data });

describe('use-online-checkout', () => {
  it('ulaznice grade success i cancel URL sa provajderom', async () => {
    setup();
    apiMock.post.mockImplementation(() => ok({ url: 'https://pay/x' }));
    const { result } = renderHook(() => useOnlineTicketCheckout(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ orderId: 'o1', provider: 'stripe' as never });
    });
    expect(apiMock.post).toHaveBeenCalledWith('/payments/checkout/tickets', {
      orderId: 'o1',
      provider: 'stripe',
      successUrl: `${window.location.origin}/ulaznice?paid=1&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/ulaznice?cancelled=1`,
    });
  });

  it('članstvo vraća url i šalje amount', async () => {
    setup();
    apiMock.post.mockImplementation(() => ok({ url: 'https://pay/m' }));
    const { result } = renderHook(() => useOnlineMembershipCheckout(), { wrapper });
    const res = await act(async () =>
      result.current.mutateAsync({ membershipId: 'mb1', amount: 30, provider: 'paypal' as never }),
    );
    expect(apiMock.post).toHaveBeenCalledWith('/payments/checkout/membership', {
      membershipId: 'mb1',
      amount: 30,
      provider: 'paypal',
      successUrl: `${window.location.origin}/clanstvo?paid=1&provider=paypal&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/clanstvo?cancelled=1`,
    });
    expect(res).toEqual({ url: 'https://pay/m' });
  });

  it('sezonska propusnica dodaje kind=season u URL-ove', async () => {
    setup();
    apiMock.post.mockImplementation(() => ok({ url: 'https://pay/s' }));
    const { result } = renderHook(() => useOnlineSeasonPassCheckout(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ passId: 'sp1', provider: 'stripe' as never });
    });
    expect(apiMock.post).toHaveBeenCalledWith('/payments/checkout/season-pass', {
      passId: 'sp1',
      provider: 'stripe',
      successUrl: `${window.location.origin}/ulaznice?kind=season&paid=1&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/ulaznice?kind=season&cancelled=1`,
    });
  });
});

describe('useLiveClock', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const live = {
    status: 'LIVE',
    clockStartedAt: '2026-01-01T12:00:00.000Z',
    matchPeriod: 'FIRST_HALF' as const,
  };

  it('bez utakmice vraća null', () => {
    const { result } = renderHook(() => useLiveClock(undefined));
    expect(result.current).toBeNull();
  });

  it('za utakmicu koja nije LIVE vraća null', () => {
    const { result } = renderHook(() => useLiveClock({ ...live, status: 'SCHEDULED' }));
    expect(result.current).toBeNull();
  });

  it('računa vrijeme i osvježava se svake sekunde', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:01:30.000Z'));
    const { result } = renderHook(() => useLiveClock(live));
    expect(result.current).not.toBeNull();
    const first = result.current?.displayMinute;

    act(() => {
      vi.setSystemTime(new Date('2026-01-01T12:02:30.000Z'));
      vi.advanceTimersByTime(1000);
    });
    expect(result.current?.displayMinute).toBeGreaterThan(first ?? 0);
  });

  it('prestanak utakmice čisti sat', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:05:00.000Z'));
    const { result, rerender } = renderHook(({ m }) => useLiveClock(m), {
      initialProps: { m: live as typeof live | undefined },
    });
    expect(result.current).not.toBeNull();
    rerender({ m: undefined });
    expect(result.current).toBeNull();
  });
});
