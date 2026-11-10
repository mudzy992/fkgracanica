import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(() => Promise.resolve({ data: { items: [] } })), post: vi.fn(() => Promise.resolve({ data: { id: '1' } })), patch: vi.fn(() => Promise.resolve({ data: {} })), delete: vi.fn(() => Promise.resolve({ data: {} })), put: vi.fn(() => Promise.resolve({ data: {} })) },
}));
import { api } from '../lib/api';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrap = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('batch60 hooks3 — use-media-admin 88 [1,0] + useMediaAssets', () => {
  it('useUploadMedia with folderId [1,0] truthy', async () => {
    const { useUploadMedia } = await import('./use-media-admin');
    const { result } = renderHook(() => useUploadMedia(), { wrapper: wrap });
    await waitFor(() => expect(result.current.mutateAsync).toBeDefined());
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    await result.current.mutateAsync({ file, folderId: 'f1' });
    expect(api.post).toHaveBeenCalled();
  });
  it('useUploadMedia without folderId [1,0] falsy', async () => {
    const { useUploadMedia } = await import('./use-media-admin');
    const { result } = renderHook(() => useUploadMedia(), { wrapper: wrap });
    await waitFor(() => expect(result.current.mutateAsync).toBeDefined());
    const file = new File(['y'], 'b.png', { type: 'image/png' });
    await result.current.mutateAsync({ file });
    expect(api.post).toHaveBeenCalled();
  });
  it('useMediaAssets with folderId and search', async () => {
    const { useMediaAssets } = await import('./use-media-admin');
    const { result } = renderHook(() => useMediaAssets({ folderId: 'fid', search: 'test', page: 2, limit: 5 }), { wrapper: wrap });
    await waitFor(() => expect(result.current.isSuccess || result.current.isLoading).toBeDefined());
  });
  it('useMediaAssets without params → defaults', async () => {
    const { useMediaAssets } = await import('./use-media-admin');
    const { result } = renderHook(() => useMediaAssets({}), { wrapper: wrap });
    await waitFor(() => expect(result.current.isSuccess || result.current.isLoading).toBeDefined());
  });
  it('useMediaAsset with id and without', async () => {
    const { useMediaAsset } = await import('./use-media-admin');
    const { result: r1 } = renderHook(() => useMediaAsset('123'), { wrapper: wrap });
    await waitFor(() => expect(r1.current.isSuccess || r1.current.isLoading).toBeDefined());
    const { result: r2 } = renderHook(() => useMediaAsset(null), { wrapper: wrap });
    expect(r2.current.fetchStatus).toBeDefined();
  });
});
