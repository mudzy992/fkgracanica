import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useStandings, useCreatePlayer, useUpdatePlayer, useDeletePlayer,
  useCreateClub, useUpdateClub, useDeleteClub, useCreateCompetition, useUpdateCompetition,
  useDeleteCompetition, useCreateMatch, useUpdateMatch, useDeleteMatch, useSetMatchLineup,
} from './use-competition-admin';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

describe('takmičenja i postave: admin hookovi', () => {
  it('bez sezone ne traži tabelu; kolo 0 se ne gubi, a null predstavlja sva kola', async () => {
    const { qc, wrapper } = setup();
    api.get.mockResolvedValue({ data: [{ clubId: 'club-1', points: 3 }] });
    const view = renderHook(({ season, round }: { season?: string; round: number | null }) => useStandings(season, round), {
      wrapper, initialProps: { season: undefined as string | undefined, round: null as number | null },
    });
    expect(api.get).not.toHaveBeenCalled();
    view.rerender({ season: 'season-1', round: 0 });
    await waitFor(() => expect(view.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/statistics/standings', { params: { seasonId: 'season-1', upToRound: 0 } });
    expect(qc.getQueryData(['standings', 'season-1', 0])).toEqual([{ clubId: 'club-1', points: 3 }]);
    view.rerender({ season: 'season-1', round: null });
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/statistics/standings', { params: { seasonId: 'season-1' } }));
    expect(qc.getQueryData(['standings', 'season-1', 'all'])).toEqual([{ clubId: 'club-1', points: 3 }]);
  });

  it.each([
    { hook: useCreatePlayer, method: 'post', path: '/players', vars: { name: 'P' }, body: { name: 'P' }, keys: [['players']] },
    { hook: useUpdatePlayer, method: 'patch', path: '/players/p1', vars: { id: 'p1', name: 'P2' }, body: { name: 'P2' }, keys: [['players']] },
    { hook: useDeletePlayer, method: 'delete', path: '/players/p1', vars: 'p1', keys: [['players']] },
    { hook: useCreateClub, method: 'post', path: '/clubs', vars: { name: 'C' }, body: { name: 'C' }, keys: [['clubs'], ['clubs', 'own']] },
    { hook: useUpdateClub, method: 'patch', path: '/clubs/c1', vars: { id: 'c1', name: 'C2' }, body: { name: 'C2' }, keys: [['clubs'], ['clubs', 'own']] },
    { hook: useDeleteClub, method: 'delete', path: '/clubs/c1', vars: 'c1', keys: [['clubs'], ['clubs', 'own']] },
    { hook: useCreateCompetition, method: 'post', path: '/competitions', vars: { name: 'Liga', isLeague: false }, body: { name: 'Liga', isLeague: false }, keys: [['competitions']] },
    { hook: useUpdateCompetition, method: 'patch', path: '/competitions/l1', vars: { id: 'l1', isLeague: true }, body: { isLeague: true }, keys: [['competitions']] },
    { hook: useDeleteCompetition, method: 'delete', path: '/competitions/l1', vars: 'l1', keys: [['competitions']] },
    { hook: useCreateMatch, method: 'post', path: '/matches', vars: { homeClubId: 'c1' }, body: { homeClubId: 'c1' }, keys: [['matches']] },
    { hook: useUpdateMatch, method: 'patch', path: '/matches/m1', vars: { id: 'm1', homeClubId: 'c2' }, body: { homeClubId: 'c2' }, keys: [['matches']] },
    { hook: useDeleteMatch, method: 'delete', path: '/matches/m1', vars: 'm1', keys: [['matches']] },
  ])('$method $path šalje tačan payload i invalidira pripadajuće ključeve', async ({ hook, method, path, vars, body, keys }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api[method as keyof typeof api].mockResolvedValue({ data: { id: 'response' } });
    const { result } = renderHook(() => hook(), { wrapper });
    await act(async () => { expect(await result.current.mutateAsync(vars as never)).toEqual({ id: 'response' }); });
    if (method === 'delete') expect(api.delete).toHaveBeenCalledWith(path);
    else expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path, body);
    expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual(keys);
  });

  it('prazna i popunjena postava čuvaju slotove i nulte koordinate; 409 ne invalidira cache', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.put.mockResolvedValueOnce({ data: { slots: [] } }).mockResolvedValueOnce({ data: { ok: true } }).mockRejectedValueOnce(new Error('409'));
    const { result } = renderHook(() => useSetMatchLineup(), { wrapper });
    await act(async () => { await result.current.mutateAsync({ matchId: 'm1', slots: [] }); });
    expect(api.put).toHaveBeenNthCalledWith(1, '/matches/m1/lineup', { slots: [] });
    const slots = [{ playerId: 'p1', clubId: 'c1', positionX: 0, positionY: 0, isStarter: false }];
    await act(async () => { await result.current.mutateAsync({ matchId: 'm1', slots }); });
    expect(api.put).toHaveBeenNthCalledWith(2, '/matches/m1/lineup', { slots });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['matches'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['matches', 'm1'] });
    invalidate.mockClear();
    await act(async () => { await expect(result.current.mutateAsync({ matchId: 'm1', slots })).rejects.toThrow('409'); });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('konflikt promjene kluba ne glumi uspjeh niti invalidira utakmice', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.patch.mockRejectedValue(new Error('409'));
    const { result } = renderHook(() => useUpdateMatch(), { wrapper });
    await act(async () => { await expect(result.current.mutateAsync({ id: 'm1', homeClubId: 'c2' })).rejects.toThrow('409'); });
    expect(api.patch).toHaveBeenCalledWith('/matches/m1', { homeClubId: 'c2' });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
