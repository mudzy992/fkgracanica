import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useNotificationRealtime, useSettingsRealtime } from './use-notifications';

const mocks = vi.hoisted(() => ({
  api: { get: vi.fn(), patch: vi.fn() },
  socket: { on: vi.fn(), off: vi.fn() },
}));
vi.mock('../lib/api', () => ({ api: mocks.api }));
vi.mock('../lib/realtime', () => ({ getRealtimeSocket: () => mocks.socket }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

describe('notifikacije i realtime invalidacija', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => vi.restoreAllMocks());

  it('traži nepročitane i stranicu kroz query, pa čuva odgovor', async () => {
    const { qc, wrapper } = setup();
    const data = { data: [{ id: 'n1' }], meta: { total: 1 } };
    mocks.api.get.mockResolvedValue({ data });
    const hook = renderHook(() => useNotifications({ unreadOnly: true, page: 2 }), { wrapper });
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(mocks.api.get).toHaveBeenCalledWith('/notifications', { params: { unreadOnly: 'true', page: 2 } });
    expect(qc.getQueryData(['notifications', true, 2])).toEqual(data);
  });

  it.each([
    { hook: useMarkNotificationRead, arg: 'notice-1', path: '/notifications/notice-1/read' },
    { hook: useMarkAllNotificationsRead, arg: undefined, path: '/notifications/read-all' },
  ])('mutacija $path invalidira samo nakon uspjeha', async ({ hook, arg, path }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();
    mocks.api.patch.mockResolvedValueOnce({ data: { ok: true } }).mockRejectedValueOnce(new Error('503'));
    const mutation = renderHook(() => hook(), { wrapper });
    await act(async () => { await mutation.result.current.mutateAsync(arg as never); });
    expect(mocks.api.patch).toHaveBeenCalledWith(path);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['notifications'] });
    invalidate.mockClear();
    await act(async () => { await expect(mutation.result.current.mutateAsync(arg as never)).rejects.toThrow('503'); });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it.each([
    { hook: useNotificationRealtime, event: 'notification:new', key: ['notifications'] },
    { hook: useSettingsRealtime, event: 'settings:changed', key: ['settings'] },
  ])('$event invalidira svoj cache i uklanja istog handlera na unmount', ({ hook, event, key }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();
    const view = renderHook(() => hook(), { wrapper });
    expect(mocks.socket.on).toHaveBeenCalledWith(event, expect.any(Function));
    const handler = mocks.socket.on.mock.calls[0][1] as () => void;
    act(() => handler());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: key });
    view.unmount();
    expect(mocks.socket.off).toHaveBeenCalledWith(event, handler);
  });
});
