import { StrictMode, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isPaymentSessionConfirmed, type PaymentSession } from '../lib/payment-session';
import { usePaymentSessionReturn } from './use-payment-session-return';

type Reply = { status: string };
const session: PaymentSession = { kind: 'tickets', sessionId: 'fixture-1', userId: 'user-1', provider: 'stripe' };
const activated = (res: Reply) => res.status === 'paid';
function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}
function wrapper(qc: QueryClient, strict = false) {
  return ({ children }: { children: ReactNode }) => {
    const provider = <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    return strict ? <StrictMode>{provider}</StrictMode> : provider;
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('payment session return (FE-06)', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); });

  it.each([
    ['tickets', 'paid'], ['membership', 'ACTIVE'], ['season', 'ACTIVE'],
  ] as const)('%s: pending nije potvrđen; reload ponavlja i markira samo aktivan odgovor', async (kind, good) => {
    const current = { ...session, kind };
    const qc = client();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    const confirm = vi.fn().mockResolvedValueOnce({ status: 'pending' }).mockResolvedValueOnce({ status: good });
    const options = { ...current, paid: true, enabled: true, invalidateKey: ['key'], confirm, isActivated: (res: Reply) => res.status === good };
    const first = renderHook(() => usePaymentSessionReturn(options), { wrapper: wrapper(qc) });
    await waitFor(() => expect(first.result.current.status).toBe('pending'));
    expect(isPaymentSessionConfirmed(current)).toBe(false);
    first.unmount();
    const second = renderHook(() => usePaymentSessionReturn(options), { wrapper: wrapper(qc) });
    await waitFor(() => expect(second.result.current.status).toBe('activated'));
    expect(isPaymentSessionConfirmed(current)).toBe(true);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['key'] });
    second.unmount();
    const third = renderHook(() => usePaymentSessionReturn(options), { wrapper: wrapper(qc) });
    await waitFor(() => expect(third.result.current.status).toBe('activated'));
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it('ignoriše stari marker i hvata grešku prije ručnog retryja bez paralelnih poziva', async () => {
    sessionStorage.setItem('fk_confirm_tickets:fixture-1', '1');
    const qc = client();
    const next = deferred<Reply>();
    const confirm = vi.fn().mockRejectedValueOnce(new Error('503')).mockReturnValueOnce(next.promise);
    const options = { ...session, paid: true, enabled: true, invalidateKey: ['ticketing', 'orders'], confirm, isActivated: activated };
    const hook = renderHook(() => usePaymentSessionReturn(options), { wrapper: wrapper(qc) });
    await waitFor(() => expect(hook.result.current.status).toBe('error'));
    expect(isPaymentSessionConfirmed(session)).toBe(false);
    act(() => { hook.result.current.retry(); hook.result.current.retry(); });
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(2));
    expect(hook.result.current.status).toBe('confirming');
    await act(async () => next.resolve({ status: 'paid' }));
    await waitFor(() => expect(hook.result.current.status).toBe('activated'));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(isPaymentSessionConfirmed(session)).toBe(true);
  });

  it('StrictMode i nova referenca query ključa ne otkazuju odgođeni odgovor', async () => {
    const qc = client();
    const next = deferred<Reply>();
    const confirm = vi.fn().mockReturnValue(next.promise);
    const hook = renderHook(() => usePaymentSessionReturn({ ...session, kind: 'season', paid: true, enabled: true,
      invalidateKey: ['ticketing', 'season-pass'], confirm, isActivated: (res: Reply) => res.status === 'ACTIVE' }), { wrapper: wrapper(qc, true) });
    hook.rerender();
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    await act(async () => next.resolve({ status: 'ACTIVE' }));
    await waitFor(() => expect(hook.result.current.status).toBe('activated'));
    expect(isPaymentSessionConfirmed({ ...session, kind: 'season' })).toBe(true);
  });

  it('dijeli zahtjev tokom unmount/remount i zanemaruje rezultat stare sesije', async () => {
    const qc = client();
    const firstReply = deferred<Reply>();
    const secondReply = deferred<Reply>();
    const confirm = vi.fn((id: string) => id === 'fixture-1' ? firstReply.promise : secondReply.promise);
    const useReturnFor = (id: string) => usePaymentSessionReturn({ ...session, sessionId: id, paid: true, enabled: true,
      invalidateKey: ['orders'], confirm, isActivated: activated });
    const first = renderHook(({ id }) => useReturnFor(id), { wrapper: wrapper(qc), initialProps: { id: 'fixture-1' } });
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    first.unmount();
    const second = renderHook(({ id }) => useReturnFor(id), { wrapper: wrapper(qc), initialProps: { id: 'fixture-1' } });
    expect(confirm).toHaveBeenCalledTimes(1);
    second.rerender({ id: 'fixture-2' });
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(2));
    await act(async () => secondReply.resolve({ status: 'pending' }));
    await waitFor(() => expect(second.result.current.status).toBe('pending'));
    await act(async () => firstReply.resolve({ status: 'paid' }));
    expect(second.result.current.status).toBe('pending');
    expect(isPaymentSessionConfirmed(session)).toBe(false);
  });

  it('ne pokreće potvrdu za gosta; neuspješan refresh cachea ne blokira potvrdu', async () => {
    const qc = client();
    vi.spyOn(qc, 'invalidateQueries').mockRejectedValue(new Error('refresh failed'));
    const confirm = vi.fn().mockResolvedValue({ status: 'paid' });
    const hook = renderHook(({ enabled }) => usePaymentSessionReturn({ ...session, paid: true, enabled,
      invalidateKey: ['orders'], confirm, isActivated: activated }), { wrapper: wrapper(qc), initialProps: { enabled: false } });
    expect(hook.result.current.status).toBe('idle');
    expect(confirm).not.toHaveBeenCalled();
    hook.rerender({ enabled: true });
    await waitFor(() => expect(hook.result.current.status).toBe('activated'));
    expect(confirm).toHaveBeenCalledTimes(1);
  });
});
