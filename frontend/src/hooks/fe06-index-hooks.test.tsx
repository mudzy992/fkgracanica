import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  usePublishedNews, useNewsList, useNewsItem, useGalleryList, useGalleryItem, useSponsors,
  useTrophies, useClubTimeline, usePlayers, useClubs, useOwnClub, useMatches, useMatch,
  useHallOfFame, useMuseum, usePublicSettings, useModuleFlags, usePrivateSettings,
  useDashboardKpis, useUsers, useRoles, usePermissions, useAuditLog, useCompetitions,
  useSeasons, useSubscribeNewsletter, useContactSubmit, useUpdatePublicSettings,
  useUpdatePrivateSettings,
} from './index';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

const empty = { data: [] };
const calls: Array<[string, () => unknown, string, unknown?]> = [
  ['published news', () => usePublishedNews(), '/news/published', { params: undefined }],
  ['published news po kategoriji', () => usePublishedNews('c1'), '/news/published', { params: { categoryId: 'c1' } }],
  ['news lista', () => useNewsList(), '/news', { params: {} }],
  ['news lista sa filterima', () => useNewsList('PUBLISHED', 'c1'), '/news', { params: { status: 'PUBLISHED', categoryId: 'c1' } }],
  ['galerija javno', () => useGalleryList(), '/gallery', { params: { status: 'PUBLISHED' } }],
  ['galerija sa statusom', () => useGalleryList('DRAFT'), '/gallery', { params: { status: 'DRAFT' } }],
  ['galerija po slugu', () => useGalleryItem('s1'), '/gallery/slug/s1', undefined],
  ['sponzori', () => useSponsors(), '/sponsors', undefined],
  ['trofeji', () => useTrophies(), '/trophies', undefined],
  ['hronologija', () => useClubTimeline(), '/club-timeline', undefined],
  ['igrači bez opcija', () => usePlayers(), '/players', { params: { clubId: undefined, activeOnly: undefined } }],
  ['igrači sa opcijama', () => usePlayers({ clubId: 'c1', activeOnly: true }), '/players', { params: { clubId: 'c1', activeOnly: 'true' } }],
  ['klubovi', () => useClubs(), '/clubs', undefined],
  ['vlastiti klub', () => useOwnClub(), '/clubs/own', undefined],
  ['utakmice bez filtera', () => useMatches(), '/matches', { params: {} }],
  ['utakmice sa filterima', () => useMatches('s1', 'r1'), '/matches', { params: { seasonId: 's1', roundId: 'r1' } }],
  ['utakmica', () => useMatch('m1'), '/matches/m1', undefined],
  ['hall of fame', () => useHallOfFame(), '/hall-of-fame', undefined],
  ['muzej', () => useMuseum(), '/museum', undefined],
  ['javne postavke', () => usePublicSettings(), '/settings/public', undefined],
  ['module flags', () => useModuleFlags(), '/settings/module-flags', undefined],
  ['privatne postavke', () => usePrivateSettings(), '/settings/private', undefined],
  ['KPI', () => useDashboardKpis(), '/dashboard/kpis', undefined],
  ['korisnici', () => useUsers({ page: 2 }), '/users', { params: { page: 2 } }],
  ['role', () => useRoles(), '/rbac/roles', undefined],
  ['dozvole', () => usePermissions(), '/rbac/permissions', undefined],
  ['audit log', () => useAuditLog({ action: 'LOGIN' }), '/audit', { params: { action: 'LOGIN' } }],
  ['takmičenja', () => useCompetitions(), '/competitions', undefined],
  ['sezone', () => useSeasons(), '/seasons', undefined],
];

describe('javni i admin hookovi iz hooks/index', () => {
  it.each(calls)('%s traži tačnu putanju i parametre', async (_name, hook, path, options) => {
    const { wrapper } = setup();
    api.get.mockResolvedValue(empty);
    const { result } = renderHook(() => hook() as never, { wrapper });
    await waitFor(() => expect((result.current as never as { isSuccess: boolean }).isSuccess).toBe(true));
    if (options === undefined) expect(api.get).toHaveBeenCalledWith(path);
    else expect(api.get).toHaveBeenCalledWith(path, options);
  });

  it('detalj vijesti prvo pokušava slug, pa id; prazan slug se ne traži', async () => {
    const { wrapper } = setup();
    api.get.mockRejectedValueOnce(new Error('synthetic 404')).mockResolvedValue({ data: { id: 'n1' } });
    const { result } = renderHook(() => useNewsItem('n1'), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual({ id: 'n1' }));
    expect(api.get.mock.calls).toEqual([['/news/slug/n1'], ['/news/n1']]);
    api.get.mockClear();
    const emptySlug = renderHook(() => useNewsItem(''), { wrapper });
    expect(api.get).not.toHaveBeenCalled();
    expect(emptySlug.result.current.fetchStatus).toBe('idle');
  });

  it('prazan matchId ne pokreće upit', () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useMatch(''), { wrapper });
    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('mutacije iz hooks/index', () => {
  it('newsletter i kontakt šalju očekivani payload bez invalidacije', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValue({ data: { ok: true } });
    const newsletter = renderHook(() => useSubscribeNewsletter(), { wrapper });
    await act(async () => { await newsletter.result.current.mutateAsync('a@b.c'); });
    const contact = renderHook(() => useContactSubmit(), { wrapper });
    await act(async () => { await contact.result.current.mutateAsync({ name: 'A', email: 'a@b.c', message: 'M' }); });
    expect(api.post.mock.calls).toEqual([
      ['/newsletter/subscribe', { email: 'a@b.c' }],
      ['/contact', { name: 'A', email: 'a@b.c', message: 'M' }],
    ]);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'javne', hook: useUpdatePublicSettings, path: '/settings/public', keys: [['settings', 'public'], ['settings', 'module-flags']] },
    { name: 'privatne', hook: useUpdatePrivateSettings, path: '/settings/private', keys: [['settings', 'private'], ['settings', 'module-flags']] },
  ])('$name postavke se spašavaju i invalidiraju oba ključa', async ({ hook, path, keys }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.put.mockResolvedValue({ data: { ok: true } });
    const { result } = renderHook(() => hook(), { wrapper });
    await act(async () => { await result.current.mutateAsync({ siteName: 'FK' }); });
    expect(api.put).toHaveBeenCalledWith(path, { siteName: 'FK' });
    expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual(keys);
  });
});
