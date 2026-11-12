import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useClub, useClubSquad, useClubStadium, useClubStats, useClubParticipations,
  useUpdateClubFormation, useAssignClubSquad, useUpsertClubStadium, useClubsWithCounts,
} from './use-club-hub';
import {
  useNewsletterCampaigns, useCreateNewsletterCampaign, usePreviewNewsletterCampaign,
  useSendNewsletterCampaign, useNewsletterCampaignRealtime,
} from './use-newsletter-campaigns';
import type { NewsletterCampaign } from './use-newsletter-campaigns';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));
const socket = vi.hoisted(() => {
  const handlers = new Map<string, Set<(...args: unknown[]) => void>>();
  return {
    emit: vi.fn(),
    on: vi.fn((name: string, handler: (...args: unknown[]) => void) => {
      (handlers.get(name) ?? handlers.set(name, new Set()).get(name)!).add(handler);
    }),
    off: vi.fn((name: string, handler: (...args: unknown[]) => void) => { handlers.get(name)?.delete(handler); }),
    fire: (name: string, payload: unknown) => handlers.get(name)?.forEach((handler) => handler(payload)),
    reset: () => handlers.clear(),
  };
});
vi.mock('../lib/realtime', () => ({ getRealtimeSocket: () => socket }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => {
  Object.values(api).forEach((mock) => mock.mockReset());
  socket.emit.mockClear(); socket.on.mockClear(); socket.off.mockClear(); socket.reset();
});

const useClubById = () => useClub('c1');
const useClubSquadById = () => useClubSquad('c1');
const useClubStadiumById = () => useClubStadium('c1');
const useClubParticipationsById = () => useClubParticipations('c1');

describe('klupski hub: čitanje', () => {
  it.each([
    { name: 'klub', hook: useClubById, path: '/clubs/c1' },
    { name: 'postava', hook: useClubSquadById, path: '/clubs/c1/squad' },
    { name: 'stadion', hook: useClubStadiumById, path: '/clubs/c1/stadium' },
    { name: 'učešća', hook: useClubParticipationsById, path: '/clubs/c1/participations' },
  ])('$name se čita sa tačne putanje', async ({ hook, path }) => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: { id: 'x' } });
    const { result } = renderHook(() => hook() as never, { wrapper });
    await waitFor(() => expect((result.current as never as { isSuccess: boolean }).isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith(path);
  });

  it('statistika prosljeđuje sezonu; prazan id ne pokreće upit', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: {} });
    const stats = renderHook(() => useClubStats('c1', 's1'), { wrapper });
    await waitFor(() => expect(stats.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/clubs/c1/stats', { params: { seasonId: 's1' } });
    api.get.mockClear();
    const empty = renderHook(() => useClub(''), { wrapper });
    expect(api.get).not.toHaveBeenCalled();
    expect(empty.result.current.fetchStatus).toBe('idle');
  });

  it('klubovi sa brojevima koriste asArray', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: [{ id: 'c1', _count: { players: 3 } }] });
    const { result } = renderHook(() => useClubsWithCounts(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'c1', _count: { players: 3 } }]);
  });
});

describe('klupski hub: izmjene', () => {
  it('formacija i postava upisuju odgovor direktno u keš', async () => {
    const { qc, wrapper } = setup();
    api.put.mockResolvedValue({ data: { formation: { def: 4, mid: 3, fwd: 3 } } });
    const formation = renderHook(() => useUpdateClubFormation('c1'), { wrapper });
    await act(async () => { await formation.result.current.mutateAsync({ def: 4, mid: 3, fwd: 3 }); });
    expect(api.put).toHaveBeenCalledWith('/clubs/c1/formation', { def: 4, mid: 3, fwd: 3 });
    expect(qc.getQueryData(['clubs', 'c1', 'squad'])).toEqual({ formation: { def: 4, mid: 3, fwd: 3 } });
    const squad = renderHook(() => useAssignClubSquad('c1'), { wrapper });
    await act(async () => { await squad.result.current.mutateAsync([{ slotIndex: 0, isBench: false, playerId: null }]); });
    expect(api.put).toHaveBeenCalledWith('/clubs/c1/squad', { assignments: [{ slotIndex: 0, isBench: false, playerId: null }] });
  });

  it('stadion se invalidira zajedno sa klubom', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.put.mockResolvedValue({ data: { ok: true } });
    const { result } = renderHook(() => useUpsertClubStadium('c1'), { wrapper });
    await act(async () => { await result.current.mutateAsync({ name: 'Stadion' }); });
    expect(api.put).toHaveBeenCalledWith('/clubs/c1/stadium', { name: 'Stadion' });
    expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual([
      ['clubs', 'c1', 'stadium'], ['clubs', 'c1'],
    ]);
  });
});

describe('newsletter kampanje', () => {
  it('lista, kreiranje, pregled i slanje koriste tačne putanje', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.get.mockResolvedValue({ data: [{ id: 'k1' }] });
    const list = renderHook(() => useNewsletterCampaigns(), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/newsletter/campaigns');
    api.post.mockResolvedValue({ data: { id: 'k1' } });
    const create = renderHook(() => useCreateNewsletterCampaign(), { wrapper });
    await act(async () => { await create.result.current.mutateAsync({ subject: 'S', textBody: 'T' }); });
    expect(api.post).toHaveBeenCalledWith('/newsletter/campaigns', { subject: 'S', textBody: 'T' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['newsletter', 'campaigns'] });
    api.post.mockResolvedValue({ data: { html: '<p>x</p>' } });
    const preview = renderHook(() => usePreviewNewsletterCampaign(), { wrapper });
    await act(async () => { await preview.result.current.mutateAsync({ subject: 'S', textBody: 'T' }); });
    expect(api.post).toHaveBeenCalledWith('/newsletter/campaigns/preview', { subject: 'S', textBody: 'T' });
    api.post.mockResolvedValue({ data: { id: 'k1' } });
    const send = renderHook(() => useSendNewsletterCampaign(), { wrapper });
    await act(async () => { await send.result.current.mutateAsync('k1'); });
    expect(api.post).toHaveBeenCalledWith('/newsletter/campaigns/k1/send');
  });

  it('realtime ažurira samo postojeću kampanju i odjavljuje se pri unmountu', () => {
    const { qc, wrapper } = setup();
    const campaigns: NewsletterCampaign[] = [
      { id: 'k1', subject: 'A', htmlBody: '', textBody: '', status: 'SENDING', sentAt: null, sentCount: 0, failCount: 0, targetCount: 10, createdAt: '2026-01-01' },
      { id: 'k2', subject: 'B', htmlBody: '', textBody: '', status: 'DRAFT', sentAt: null, sentCount: 0, failCount: 0, targetCount: 5, createdAt: '2026-01-01' },
    ];
    qc.setQueryData(['newsletter', 'campaigns'], campaigns);
    const { unmount } = renderHook(() => useNewsletterCampaignRealtime(), { wrapper });
    expect(socket.emit).toHaveBeenCalledWith('newsletter:join');
    act(() => socket.fire('newsletter:campaign', { id: 'k1', status: 'SENT', sentCount: 10, failCount: 0, targetCount: 10 }));
    act(() => socket.fire('newsletter:campaign', { id: 'nepoznat', status: 'SENT', sentCount: 1, failCount: 0, targetCount: 1 }));
    const data = qc.getQueryData<NewsletterCampaign[]>(['newsletter', 'campaigns'])!;
    expect(data[0]).toMatchObject({ id: 'k1', status: 'SENT', sentCount: 10 });
    expect(data[1].status).toBe('DRAFT');
    expect(data).toHaveLength(2);
    unmount();
    expect(socket.emit).toHaveBeenCalledWith('newsletter:leave');
    expect(socket.off).toHaveBeenCalledWith('newsletter:campaign', expect.any(Function));
  });

  it('realtime bez keša ne kreira listu', () => {
    const { qc, wrapper } = setup();
    renderHook(() => useNewsletterCampaignRealtime(), { wrapper });
    act(() => socket.fire('newsletter:campaign', { id: 'k1', status: 'SENT', sentCount: 1, failCount: 0, targetCount: 1 }));
    expect(qc.getQueryData(['newsletter', 'campaigns'])).toEqual([]);
  });
});
