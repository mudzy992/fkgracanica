import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useTicketingAdminConfig, useUpdateTicketingAdminConfig, useTicketingAdminOrders,
  useTicketingOrderDetail, useConfirmTicketingPayment, useConfirmTicketingRefund,
  useAdminCancelTicketingOrder, useValidateTicket, useSeasonPassAdminList, useIssueSeasonPass,
} from './use-ticketing-admin';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

describe('ticketing admin: izolovani hookovi bez stvarnih plaćanja', () => {
  it('učitava konfiguraciju i normalizuje liste; detalj je isključen bez ID-a', async () => {
    const { qc, wrapper } = setup();
    api.get.mockImplementation(async (path: string) => ({ data: path.endsWith('/orders')
      ? { items: [{ id: 'o1' }] } : path.endsWith('/admin') ? { results: [{ id: 'pass-1' }] } : { id: path } }));
    const view = renderHook(({ orderId }: { orderId?: string }) => ({
      config: useTicketingAdminConfig(), orders: useTicketingAdminOrders(),
      passes: useSeasonPassAdminList(), detail: useTicketingOrderDetail(orderId),
    }), { wrapper, initialProps: { orderId: undefined as string | undefined } });
    await waitFor(() => expect(view.result.current.config.isSuccess && view.result.current.orders.isSuccess && view.result.current.passes.isSuccess).toBe(true));
    expect(view.result.current.orders.data).toEqual([{ id: 'o1' }]);
    expect(view.result.current.passes.data).toEqual([{ id: 'pass-1' }]);
    expect(api.get).toHaveBeenCalledTimes(3);
    view.rerender({ orderId: 'o1' });
    await waitFor(() => expect(view.result.current.detail.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/ticketing/orders/o1');
    expect(qc.getQueryData(['ticketing', 'orders', 'o1'])).toEqual({ id: '/ticketing/orders/o1' });
  });

  it.each([
    { hook: useUpdateTicketingAdminConfig, method: 'patch', path: '/ticketing/admin/config', vars: { price: '10' }, body: { price: '10' }, keys: [['ticketing', 'admin', 'config'], ['ticketing', 'config']] },
    { hook: useConfirmTicketingPayment, method: 'post', path: '/ticketing/orders/o1/confirm-payment', vars: 'o1', keys: [['ticketing', 'admin', 'orders'], ['ticketing', 'orders', 'o1']] },
    { hook: useConfirmTicketingRefund, method: 'post', path: '/ticketing/orders/o1/confirm-refund', vars: 'o1', keys: [['ticketing', 'admin', 'orders']] },
    { hook: useAdminCancelTicketingOrder, method: 'post', path: '/ticketing/admin/orders/o1/cancel', vars: 'o1', keys: [['ticketing', 'admin', 'orders'], ['ticketing', 'orders']] },
    { hook: useIssueSeasonPass, method: 'post', path: '/ticketing/season-pass/admin/issue', vars: 'test@example.test', body: { email: 'test@example.test' }, keys: [['ticketing', 'season-pass']] },
    { hook: useValidateTicket, method: 'post', path: '/ticketing/validate', vars: { qrCode: 'fixture', matchId: 'm1' }, body: { qrCode: 'fixture', matchId: 'm1' }, keys: [] },
  ])('$method $path šalje namjerni zahtjev i osvježava cache samo na uspjeh', async ({ hook, method, path, vars, body, keys }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    const request = api[method as keyof typeof api];
    request.mockResolvedValueOnce({ data: { id: 'result', status: 'CONFIRMED' } }).mockRejectedValueOnce(new Error('403'));
    const { result } = renderHook(() => hook(), { wrapper });
    await act(async () => { expect(await result.current.mutateAsync(vars as never)).toEqual({ id: 'result', status: 'CONFIRMED' }); });
    if (body === undefined) expect(request).toHaveBeenCalledWith(path);
    else expect(request).toHaveBeenCalledWith(path, body);
    expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual(keys);
    invalidate.mockClear();
    await act(async () => { await expect(result.current.mutateAsync(vars as never)).rejects.toThrow('403'); });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
