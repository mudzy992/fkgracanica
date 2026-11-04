import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMyTicketOrders, useMatchAvailability, useTicketingPublicConfig, useMySeasonPass,
  useReserveTicket, useRequestTicketRefund, useCancelMyTicketOrder, useOpenSeasonPass } from './use-ticketing';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

describe('korisnički ticketing query i mutacije', () => {
  beforeEach(() => { api.get.mockReset(); api.post.mockReset(); });
  afterEach(() => vi.restoreAllMocks());

  it('normalizuje narudžbe, učitava konfiguraciju i sezonu; availability bez ID-a ostaje isključen', async () => {
    const { qc, wrapper } = setup();
    api.get.mockImplementation(async (path: string) => ({ data: path === '/ticketing/orders'
      ? { items: [{ id: 'order-1', status: 'pending' }] } : { fixture: path } }));
    const result = renderHook(() => ({ orders: useMyTicketOrders(), config: useTicketingPublicConfig(),
      season: useMySeasonPass(), availability: useMatchAvailability() }), { wrapper });
    await waitFor(() => expect(result.result.current.orders.isSuccess && result.result.current.season.isSuccess).toBe(true));
    expect(result.result.current.orders.data).toEqual([{ id: 'order-1', status: 'pending' }]);
    expect(qc.getQueryData(['ticketing', 'config'])).toEqual({ fixture: '/ticketing/config' });
    expect(api.get).toHaveBeenCalledWith('/ticketing/season-pass/me');
    expect(api.get).toHaveBeenCalledTimes(3);
  });

  it('rezervacija prenosi odabrane podatke i invalidira narudžbe samo na uspjeh', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();
    api.post.mockResolvedValueOnce({ data: { id: 'order-1' } }).mockRejectedValueOnce(new Error('403'));
    const result = renderHook(() => useReserveTicket(), { wrapper });
    const body = { matchId: 'match-1', category: 'Tribina', price: 5, quantity: 2 };
    await act(async () => { await result.result.current.mutateAsync(body); });
    expect(api.post).toHaveBeenCalledWith('/ticketing/reserve', body);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ticketing', 'orders'] });
    invalidate.mockClear();
    await act(async () => { await expect(result.result.current.mutateAsync(body)).rejects.toThrow('403'); });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it.each([
    { hook: useRequestTicketRefund, suffix: 'refund' },
    { hook: useCancelMyTicketOrder, suffix: 'cancel' },
  ])('$suffix koristi ID i osvježava narudžbe samo nakon uspjeha', async ({ hook, suffix }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();
    api.post.mockResolvedValueOnce({ data: { ok: true } }).mockRejectedValueOnce(new Error('409'));
    const result = renderHook(() => hook(), { wrapper });
    await act(async () => { await result.result.current.mutateAsync('order-1'); });
    expect(api.post).toHaveBeenCalledWith(`/ticketing/orders/order-1/${suffix}`);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ticketing', 'orders'] });
    invalidate.mockClear();
    await act(async () => { await expect(result.result.current.mutateAsync('order-1')).rejects.toThrow('409'); });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('otvaranje sezonske karte osvježava sezonski cache', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();
    api.post.mockResolvedValue({ data: { id: 'pass-1', status: 'PENDING' } });
    const result = renderHook(() => useOpenSeasonPass(), { wrapper });
    await act(async () => { await result.result.current.mutateAsync(); });
    expect(api.post).toHaveBeenCalledWith('/ticketing/season-pass/open');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ticketing', 'season-pass'] });
  });
});
