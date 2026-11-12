import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useGalleryAdminList, useGalleryDetail, useCreateGallery, useUpdateGallery,
  useUpdateGalleryStatus, useDeleteGallery, useAddGalleryPhoto, useAddGalleryPhotos,
  useRemoveGalleryPhoto, useReorderGalleryPhotos, useCreateSponsor, useUpdateSponsor,
  useDeleteSponsor, useReorderSponsors, useCreateTrophy, useUpdateTrophy, useDeleteTrophy,
} from './use-content-admin';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

describe('galerija, sponzori i trofeji: admin hookovi', () => {
  it('lista i detalj galerije koriste asArray i traže detalj samo uz id', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: [{ id: 'g1' }] });
    const list = renderHook(() => useGalleryAdminList(), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    expect(list.result.current.data).toEqual([{ id: 'g1' }]);
    expect(api.get).toHaveBeenCalledWith('/gallery');
    const detail = renderHook(({ id }: { id?: string }) => useGalleryDetail(id), {
      wrapper, initialProps: { id: undefined as string | undefined },
    });
    expect(api.get).toHaveBeenCalledTimes(1);
    detail.rerender({ id: 'g1' });
    await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenLastCalledWith('/gallery/g1');
  });

  it.each([
    { name: 'create', hook: useCreateGallery, method: 'post', path: '/gallery', vars: { title: 'T' }, body: { title: 'T' } },
    { name: 'update', hook: useUpdateGallery, method: 'patch', path: '/gallery/g1', vars: { id: 'g1', title: 'T2' }, body: { title: 'T2' } },
    { name: 'status', hook: useUpdateGalleryStatus, method: 'patch', path: '/gallery/g1/status', vars: { id: 'g1', status: 'PUBLISHED' }, body: { status: 'PUBLISHED' } },
    { name: 'delete', hook: useDeleteGallery, method: 'delete', path: '/gallery/g1', vars: 'g1', body: undefined },
    { name: 'add photo', hook: useAddGalleryPhoto, method: 'post', path: '/gallery/g1/photos', vars: { galleryId: 'g1', path: 'a.jpg', caption: 'C' }, body: { path: 'a.jpg', caption: 'C' } },
    { name: 'remove photo', hook: useRemoveGalleryPhoto, method: 'delete', path: '/gallery/g1/photos/p1', vars: { galleryId: 'g1', photoId: 'p1' }, body: undefined },
    { name: 'reorder photos', hook: useReorderGalleryPhotos, method: 'post', path: '/gallery/g1/photos/reorder', vars: { galleryId: 'g1', photoIds: ['p1'] }, body: { photoIds: ['p1'] } },
    { name: 'create sponsor', hook: useCreateSponsor, method: 'post', path: '/sponsors', vars: { name: 'S', tier: 'GOLD' }, body: { name: 'S', tier: 'GOLD' } },
    { name: 'update sponsor', hook: useUpdateSponsor, method: 'patch', path: '/sponsors/s1', vars: { id: 's1', name: 'S2' }, body: { name: 'S2' } },
    { name: 'delete sponsor', hook: useDeleteSponsor, method: 'delete', path: '/sponsors/s1', vars: 's1', body: undefined },
    { name: 'reorder sponsors', hook: useReorderSponsors, method: 'post', path: '/sponsors/reorder', vars: ['s2', 's1'], body: { ids: ['s2', 's1'] } },
    { name: 'create trophy', hook: useCreateTrophy, method: 'post', path: '/trophies', vars: { name: 'Kup', year: 2024 }, body: { name: 'Kup', year: 2024 } },
    { name: 'update trophy', hook: useUpdateTrophy, method: 'patch', path: '/trophies/t1', vars: { id: 't1', year: 2025 }, body: { year: 2025 } },
    { name: 'delete trophy', hook: useDeleteTrophy, method: 'delete', path: '/trophies/t1', vars: 't1', body: undefined },
  ])('$name šalje tačan zahtjev i invalidira pripadajući ključ', async ({ hook, method, path, vars, body }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api[method as keyof typeof api].mockResolvedValue({ data: { id: 'response' } });
    const { result } = renderHook(() => hook() as never, { wrapper });
    await act(async () => { await (result.current as never as { mutateAsync: (v: unknown) => Promise<unknown> }).mutateAsync(vars); });
    if (body === undefined) expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path);
    else expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path, body);
    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it('batch dodavanje šalje sve putanje redom i invalidira bez refetcha', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAddGalleryPhotos(), { wrapper });
    await act(async () => { await result.current.mutateAsync({ galleryId: 'g1', paths: ['a.jpg', 'b.jpg'] }); });
    expect(api.post.mock.calls).toEqual([
      ['/gallery/g1/photos', { path: 'a.jpg' }, { timeout: 30_000 }],
      ['/gallery/g1/photos', { path: 'b.jpg' }, { timeout: 30_000 }],
    ]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['gallery'], refetchType: 'none' });
  });

  it('batch prekida na prvoj grešci ali i tada invalidira cache', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValueOnce({ data: {} }).mockRejectedValueOnce(new Error('synthetic partial failure'));
    const { result } = renderHook(() => useAddGalleryPhotos(), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync({ galleryId: 'g1', paths: ['a.jpg', 'b.jpg', 'c.jpg'] })).rejects.toThrow('synthetic partial failure');
    });
    expect(api.post).toHaveBeenCalledTimes(2);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['gallery'], refetchType: 'none' });
  });
});
