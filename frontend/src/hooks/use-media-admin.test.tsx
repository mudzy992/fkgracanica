import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useMediaFolders, useMediaAssets, useMediaAsset, useCreateMediaFolder, useUpdateMediaFolder,
  useDeleteMediaFolder, useUploadMedia, useUpdateMediaAsset, useReplaceMedia, useDeleteMedia,
} from './use-media-admin';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

describe('media: admin query, mutacije i upload', () => {
  it('normalizuje foldere, prosljeđuje filtere i ne traži detalj bez ID-a', async () => {
    const { qc, wrapper } = setup();
    api.get.mockImplementation(async (path: string) => ({ data: path === '/media/folders'
      ? { items: [{ id: 'f1' }] } : path === '/media/assets' ? { data: [{ id: 'a1' }], total: 1 } : { id: 'a1' } }));
    const view = renderHook(({ id }: { id: string | null }) => ({
      folders: useMediaFolders(), assets: useMediaAssets({ folderId: 'f1', page: 2, search: 'grb', limit: 5 }), asset: useMediaAsset(id),
    }), { wrapper, initialProps: { id: null as string | null } });
    await waitFor(() => expect(view.result.current.folders.isSuccess && view.result.current.assets.isSuccess).toBe(true));
    expect(view.result.current.folders.data).toEqual([{ id: 'f1' }]);
    expect(api.get).toHaveBeenCalledWith('/media/assets', { params: { folderId: 'f1', page: 2, search: 'grb', limit: 5 } });
    expect(api.get).toHaveBeenCalledTimes(2);
    view.rerender({ id: 'a1' });
    await waitFor(() => expect(view.result.current.asset.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/media/assets/a1');
    expect(qc.getQueryData(['media', 'asset', 'a1'])).toEqual({ id: 'a1' });
  });

  it('podrazumijevani filteri koriste stranicu 1, limit 20 i bez prazne pretrage', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: { data: [], total: 0 } });
    const { result } = renderHook(() => useMediaAssets({ search: '' }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/media/assets', { params: { folderId: undefined, page: 1, limit: 20, search: undefined } });
  });

  it.each([
    { hook: useCreateMediaFolder, method: 'post', path: '/media/folders', vars: { name: 'Grb', parentId: 'f0' }, body: { name: 'Grb', parentId: 'f0' }, key: ['media', 'folders'] },
    { hook: useUpdateMediaFolder, method: 'patch', path: '/media/folders/f1', vars: { id: 'f1', name: 'Novo' }, body: { name: 'Novo' }, key: ['media', 'folders'] },
    { hook: useDeleteMediaFolder, method: 'delete', path: '/media/folders/f1', vars: 'f1', key: ['media', 'folders'] },
    { hook: useUpdateMediaAsset, method: 'patch', path: '/media/assets/a1', vars: { id: 'a1', folderId: null, tags: 'klub' }, body: { folderId: null, tags: 'klub' }, key: ['media', 'assets'] },
    { hook: useDeleteMedia, method: 'delete', path: '/media/assets/a1', vars: 'a1', key: ['media', 'assets'] },
  ])('$method $path ažurira odgovarajući cache samo na uspjeh', async ({ hook, method, path, vars, body, key }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    const request = api[method as keyof typeof api];
    request.mockResolvedValueOnce({ data: { id: 'result' } }).mockRejectedValueOnce(new Error('403'));
    const { result } = renderHook(() => hook(), { wrapper });
    await act(async () => { await result.current.mutateAsync(vars as never); });
    if (body === undefined) expect(request).toHaveBeenCalledWith(path);
    else expect(request).toHaveBeenCalledWith(path, body);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: key });
    invalidate.mockClear();
    await act(async () => { await expect(result.current.mutateAsync(vars as never)).rejects.toThrow('403'); });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('upload i zamjena šalju originalni File kao multipart, bez ručnog Content-Type boundaryja', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValue({ data: { id: 'a1' } });
    const file = new File(['synthetic'], 'crest.png', { type: 'image/png' });
    const { result } = renderHook(() => ({ upload: useUploadMedia(), replace: useReplaceMedia() }), { wrapper });
    await act(async () => { await result.current.upload.mutateAsync({ file, folderId: 'f1' }); });
    const [uploadPath, uploadForm, uploadOptions] = api.post.mock.calls[0];
    expect(uploadPath).toBe('/media/upload');
    expect(uploadForm.get('file')).toBe(file);
    expect(uploadForm.get('folderId')).toBe('f1');
    expect(uploadOptions).toEqual({ headers: { 'Content-Type': undefined } });
    await act(async () => { await result.current.replace.mutateAsync({ id: 'a1', file }); });
    const [replacePath, replaceForm, replaceOptions] = api.post.mock.calls[1];
    expect(replacePath).toBe('/media/assets/a1/replace');
    expect(replaceForm.get('file')).toBe(file);
    expect(replaceForm.has('folderId')).toBe(false);
    expect(replaceOptions).toEqual({ headers: { 'Content-Type': undefined } });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['media', 'assets'] });
  });
});
