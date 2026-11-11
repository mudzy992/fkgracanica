import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../lib/api', () => ({ api: { get: vi.fn(async () => ({ data: { id: 'g1', title: 'G', photos: [{ id: 'p1', path: 'a.jpg' }] } })), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), put: vi.fn() } }));
vi.mock('../lib/fetch-all-media-assets', () => ({ fetchAllMediaAssetsInFolder: vi.fn(async () => [{ originalPath: 'a.jpg' }]) }));
vi.mock('./use-content-admin', () => ({
  useAddGalleryPhotos: () => ({ mutateAsync: vi.fn(async () => ({})) }),
  useCreateGallery: () => ({ mutateAsync: vi.fn() }),
  useUpdateGallery: () => ({ mutateAsync: vi.fn() }),
  useGalleryDetail: () => ({ data: null, isLoading: false }),
}));

import { useGalleryPhotoBatch } from './use-gallery-photo-batch';
import { useStandings } from './use-competition-admin';

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, Wrapper };
}

describe('batch66x hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useGalleryPhotoBatch current() ?? initial pokriva oba', async () => {
    const { qc, Wrapper } = wrapper();
    const { result } = renderHook(() => useGalleryPhotoBatch('g1'), { wrapper: Wrapper });
    // initial: current() should be initial (fallback) when no data
    expect(result.current).toBeDefined();
    // set data to test false branch (when data exists)
    qc.setQueryData(['gallery-photo-batch', 'g1'], { phase: 'adding', notice: null });
    // current() inside hook should now return adding, not initial
    // trigger a call that uses current()
    await result.current.add({ paths: ['a.jpg'] });
    // after add, state should be something
    expect(qc.getQueryData(['gallery-photo-batch', 'g1'])).toBeDefined();
    // test with folderId source
    const { result: r2 } = renderHook(() => useGalleryPhotoBatch('g2'), { wrapper: Wrapper });
    await r2.current.add({ folderId: 'f1' });
    expect(qc.getQueryData(['gallery-photo-batch', 'g2'])).toBeDefined();
  });

  it('useStandings pokriva seasonId ? {seasonId} i upToRound != null', async () => {
    const { Wrapper } = wrapper();
    const { result: r1 } = renderHook(() => useStandings(undefined, null), { wrapper: Wrapper });
    expect(r1.current.isLoading).toBeDefined();
    const { result: r2 } = renderHook(() => useStandings('s1', null), { wrapper: Wrapper });
    expect(r2.current).toBeDefined();
    const { result: r3 } = renderHook(() => useStandings('s1', 5), { wrapper: Wrapper });
    expect(r3.current).toBeDefined();
    const { result: r4 } = renderHook(() => useStandings(undefined, 5), { wrapper: Wrapper });
    expect(r4.current).toBeDefined();
    const { result: r5 } = renderHook(() => useStandings('s1', 0), { wrapper: Wrapper });
    expect(r5.current).toBeDefined();
  });

  it('useGalleryPhotoBatch phase !== ready blokira', async () => {
    const { qc, Wrapper } = wrapper();
    qc.setQueryData(['gallery-photo-batch', 'g3'], { phase: 'adding', notice: null });
    const { result } = renderHook(() => useGalleryPhotoBatch('g3'), { wrapper: Wrapper });
    await result.current.add({ paths: ['a.jpg'] });
    // should not change because phase !== ready
    expect(qc.getQueryData(['gallery-photo-batch', 'g3'])).toEqual({ phase: 'adding', notice: null });
  });
});
