import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGalleryPhotoBatch } from './use-gallery-photo-batch';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

const gallery = (paths: string[] = []) => ({
  id: 'g',
  title: 'Album',
  status: 'DRAFT',
  photos: paths.map((path, index) => ({ id: `p${index}`, path })),
});

function setup(withDetail = true) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  if (withDetail) qc.setQueryData(['gallery', 'g'], gallery(['a']));
  const wrapper = ({ children }: { children: ReactNode }) =>
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset().mockResolvedValue({ data: {} });
});

describe('GalleryPhotoBatch — dodatne putanje provjere', () => {
  it('bez detalja u kešu prvo ga dohvaća, pa dodaje nove putanje', async () => {
    const { qc, wrapper } = setup(false);
    api.get.mockResolvedValue({ data: gallery(['a']) });
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await act(async () => {
      await result.current.add({ paths: ['a', 'b'] });
    });
    expect(api.get).toHaveBeenCalledWith('/gallery/g', {
      timeout: 15_000,
      headers: { 'Cache-Control': 'no-cache' },
    });
    expect(api.post).toHaveBeenCalledWith('/gallery/g/photos', { path: 'b' }, { timeout: 30_000 });
    expect(qc.getQueryData(['gallery', 'g'])).toEqual(gallery(['a']));
    expect(result.current.state).toEqual({ phase: 'ready', notice: null });
  });

  it('dohvaćen ali neispravan detalj blokira dodavanje bez POST-a', async () => {
    const { wrapper } = setup(false);
    api.get.mockResolvedValue({ data: { id: 'g', title: 'Album', photos: [{ id: 1, path: 2 }] } });
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await act(async () => {
      await result.current.add({ paths: ['a'] });
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({ phase: 'blocked', notice: 'initialUnverified' }),
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it('retryRefresh ne radi ništa kad album nije blokiran', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    api.get.mockResolvedValue({ data: gallery(['a']) });
    await act(async () => {
      await result.current.retryRefresh();
    });
    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.state).toEqual({ phase: 'ready', notice: null });
  });

  it('uspješno dodavanje bez greške vraća notice null i osvježava keš', async () => {
    const { qc, wrapper } = setup();
    api.get.mockResolvedValue({ data: gallery(['a', 'b']) });
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await act(async () => {
      await result.current.add({ paths: ['b'] });
    });
    await waitFor(() => expect(result.current.state).toEqual({ phase: 'ready', notice: null }));
    expect(qc.getQueryData(['gallery', 'g'])).toEqual(gallery(['a', 'b']));
    expect(qc.getQueryState(['gallery', 'g'])?.status).toBe('success');
  });

  it('ručni refetch stanja vraća početno stanje iz queryFn', async () => {
    const { qc, wrapper } = setup();
    renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    const query = qc.getQueryCache().find({ queryKey: ['gallery-photo-batch', 'g'] });
    let data: unknown;
    await act(async () => {
      data = await query?.fetch();
    });
    expect(data).toEqual({ phase: 'ready', notice: null });
  });

  it('detalj koji se pokvari nakon uspješnog čitanja blokira tok', async () => {
    const { qc, wrapper } = setup(false);
    api.get.mockResolvedValue({ data: gallery(['a']) });
    const original = qc.setQueryData.bind(qc);
    vi.spyOn(qc, 'setQueryData').mockImplementation(((key: readonly unknown[], value: unknown, opts?: unknown) => {
      const result = original(key as never, value as never, opts as never);
      if (Array.isArray(key) && key[0] === 'gallery') {
        original(['gallery', 'g'], { id: 'g', title: 'Album', photos: 'neispravno' } as never);
      }
      return result;
    }) as typeof qc.setQueryData);
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await act(async () => {
      await result.current.add({ paths: ['b'] });
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({ phase: 'blocked', notice: 'initialUnverified' }),
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it('neočekivana greška u toku blokira dodavanje kao nepotvrđeno', async () => {
    const { qc, wrapper } = setup(false);
    api.get.mockResolvedValue({ data: gallery(['a']) });
    const original = qc.setQueryData.bind(qc);
    let thrown = false;
    vi.spyOn(qc, 'setQueryData').mockImplementation(((key: readonly unknown[], value: unknown, opts?: unknown) => {
      const phase = (value as { phase?: string }).phase;
      if (Array.isArray(key) && key[0] === 'gallery-photo-batch' && phase === 'checking' && !thrown) {
        thrown = true;
        throw new Error('keš nije dostupan');
      }
      return original(key as never, value as never, opts as never);
    }) as typeof qc.setQueryData);
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await act(async () => {
      await result.current.add({ paths: ['b'] });
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({ phase: 'blocked', notice: 'partialUnverified' }),
    );
    expect(api.post).not.toHaveBeenCalled();
  });
});
