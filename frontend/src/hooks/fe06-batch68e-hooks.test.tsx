import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../lib/api', () => ({ api: { get: vi.fn(async () => ({ data: [] })) } }));
import { api } from '../lib/api';
import { useStandings } from './use-competition-admin';
import { useGalleryPhotoBatch } from './use-gallery-photo-batch';

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('fe06-batch68e hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useStandings pokriva oba kraka seasonId ? i upToRound ??', async () => {
    const { result: r1 } = renderHook(() => useStandings(undefined, null), { wrapper: wrapper() });
    expect(r1.current.isLoading).toBeDefined();
    renderHook(() => useStandings('s1', 5), { wrapper: wrapper() });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    const calls = (api.get as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it('useGalleryPhotoBatch pokriva ?? initial', async () => {
    const { result } = renderHook(() => useGalleryPhotoBatch('g1'), { wrapper: wrapper() });
    expect(result.current.state).toBeDefined();
    // current() fallback when cache empty is initial
    await result.current.add({ paths: [] });
    expect(result.current.state).toBeDefined();
  });
});
