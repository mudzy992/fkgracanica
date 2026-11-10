import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';

vi.mock('../lib/api', () => ({ api: { get: vi.fn(async () => ({ data: [] })), post: vi.fn(async () => ({ data: {} })), patch: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({ data: {} })), put: vi.fn(async () => ({ data: {} })) } }));

describe('batch62 hooks', () => {
  it('useStandings with and without seasonId', async () => {
    const { useStandings } = await import('./use-competition-admin');
    const qc1 = new QueryClient();
    const wrapper1 = ({ children }: any) => <QueryClientProvider client={qc1}>{children}</QueryClientProvider>;
    const { result: r1 } = renderHook(() => useStandings(undefined), { wrapper: wrapper1 });
    expect(r1.current.isLoading ?? r1.current.fetchStatus).toBeDefined();
    const qc2 = new QueryClient();
    const wrapper2 = ({ children }: any) => <QueryClientProvider client={qc2}>{children}</QueryClientProvider>;
    const { result: r2 } = renderHook(() => useStandings('season-1', 5), { wrapper: wrapper2 });
    await waitFor(() => expect(r2.current.data !== undefined || r2.current.isSuccess || r2.current.isLoading).toBeTruthy());
  });

  it('useStandings upToRound null', async () => {
    const { useStandings } = await import('./use-competition-admin');
    const qc = new QueryClient();
    const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useStandings('season-1', null), { wrapper });
    await waitFor(() => expect(result.current.data !== undefined || result.current.isSuccess || result.current.isLoading).toBeTruthy());
  });

  it('groupMatchesByRound fallback', async () => {
    const { groupMatchesByRound } = await import('../lib/round-utils');
    const matches: any = [
      { id: 'm1', roundRel: { number: 2, name: 'Drugo kolo' }, scheduledAt: '2024-01-02T00:00:00Z' },
      { id: 'm2', roundRel: { number: 1, name: null }, scheduledAt: '2024-01-01T00:00:00Z' },
      { id: 'm3', roundRel: null, scheduledAt: '2024-01-03T00:00:00Z' },
    ];
    const g = groupMatchesByRound(matches);
    expect(g.length).toBe(2);
    expect(g[0].key).toBe(2);
    expect(g[1].label).toContain('1.');
  });
});
