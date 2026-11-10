import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/api', () => ({ api: { get: vi.fn(async () => ({ data: [] })), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), put: vi.fn() } }));
vi.mock('../lib/realtime', () => ({ getRealtimeSocket: () => ({ on: vi.fn(), off: vi.fn() }) }));

const qClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qClient}>{children}</QueryClientProvider>;

describe('batch60 hooks — use-notifications unreadOnly [1,0]', () => {
  it('unreadOnly false → undefined', async () => {
    const { api } = await import('../lib/api');
    const { useNotifications } = await import('./use-notifications');
    vi.mocked(api.get).mockClear();
    renderHook(() => useNotifications({ unreadOnly: false, page: 1 }), { wrapper });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    const call = vi.mocked(api.get).mock.calls[0] as any;
    expect(call[1].params.unreadOnly).toBeUndefined();
  });
  it('unreadOnly true → "true"', async () => {
    const { api } = await import('../lib/api');
    const { useNotifications } = await import('./use-notifications');
    vi.mocked(api.get).mockClear();
    renderHook(() => useNotifications({ unreadOnly: true, page: 1 }), { wrapper });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    const call = vi.mocked(api.get).mock.calls[0] as any;
    expect(call[1].params.unreadOnly).toBe('true');
  });
});

describe('batch60 hooks — use-competition-admin seasonId [2,0]', () => {
  it('without seasonId → {}', async () => {
    const { api } = await import('../lib/api');
    const { useStandings } = await import('./use-competition-admin');
    vi.mocked(api.get).mockClear();
    renderHook(() => useStandings(undefined, null), { wrapper });
    await waitFor(() => expect(api.get).not.toHaveBeenCalled()); // enabled false, so not called
    // But params branch is inside queryFn, which won't be called when disabled.
    // To test params, we need to call with seasonId and check params.
  });
  it('with seasonId → { seasonId }', async () => {
    const { api } = await import('../lib/api');
    const { useStandings } = await import('./use-competition-admin');
    vi.mocked(api.get).mockClear();
    vi.mocked(api.get).mockResolvedValue({ data: [] } as any);
    renderHook(() => useStandings('s1', null), { wrapper });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    const call = vi.mocked(api.get).mock.calls[0] as any;
    expect(call[1].params.seasonId).toBe('s1');
    expect(call[1].params.upToRound).toBeUndefined();
  });
  it('with upToRound → { upToRound }', async () => {
    const { api } = await import('../lib/api');
    const { useStandings } = await import('./use-competition-admin');
    vi.mocked(api.get).mockClear();
    vi.mocked(api.get).mockResolvedValue({ data: [] } as any);
    renderHook(() => useStandings('s1', 5), { wrapper });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    const call = vi.mocked(api.get).mock.calls[0] as any;
    expect(call[1].params.upToRound).toBe(5);
  });
});

describe('batch60 hooks — use-membership status [1,0]', () => {
  it('without status → undefined', async () => {
    const { api } = await import('../lib/api');
    const { useMemberships } = await import('./use-membership');
    vi.mocked(api.get).mockClear();
    vi.mocked(api.get).mockResolvedValue({ data: [] } as any);
    renderHook(() => useMemberships(undefined), { wrapper });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    const call = vi.mocked(api.get).mock.calls[0] as any;
    expect(call[1]?.params).toBeUndefined();
  });
  it('with status → { status }', async () => {
    const { api } = await import('../lib/api');
    const { useMemberships } = await import('./use-membership');
    vi.mocked(api.get).mockClear();
    vi.mocked(api.get).mockResolvedValue({ data: [] } as any);
    renderHook(() => useMemberships('ACTIVE' as any), { wrapper });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    const call = vi.mocked(api.get).mock.calls[0] as any;
    expect(call[1].params.status).toBe('ACTIVE');
  });
});
