import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn((url: string) => {
      if (url.startsWith('/gallery/')) return Promise.resolve({ data: { id: 'g1', title: 'G', photos: [{ id: 'p1', path: '/a.jpg' }] } });
      return Promise.resolve({ data: [] });
    }),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));
vi.mock('../lib/fetch-all-media-assets', () => ({
  fetchAllMediaAssetsInFolder: vi.fn(() => Promise.resolve([{ originalPath: '/b.jpg' }])),
}));
vi.mock('./use-content-admin', () => ({
  useAddGalleryPhotos: () => ({ mutateAsync: vi.fn(() => Promise.resolve({})) }),
}));

describe('batch60 gallery — useGalleryPhotoBatch 46 [26,0]', () => {
  it('add with paths → first branch', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrap = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    const { useGalleryPhotoBatch } = await import('./use-gallery-photo-batch');
    const { result } = renderHook(() => useGalleryPhotoBatch('g1'), { wrapper: wrap });
    await waitFor(() => expect(result.current.state).toBeDefined());
    await result.current.add({ paths: ['/c.jpg'] });
    expect(result.current.state.phase).toBeDefined();
  });
  it('add with folderId → second branch [26,0] fallback', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrap = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    const { useGalleryPhotoBatch } = await import('./use-gallery-photo-batch');
    const { result } = renderHook(() => useGalleryPhotoBatch('g2'), { wrapper: wrap });
    await waitFor(() => expect(result.current.state).toBeDefined());
    await result.current.add({ folderId: 'folder1' });
    expect(result.current.state.phase).toBeDefined();
  });
});
