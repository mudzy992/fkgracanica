import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTopScorers, useTopAssists, useMatchStatistics, useTeamStats, useNewsForMatch } from './use-public-web';

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { api.get.mockReset(); });

const useTopScorersForS1 = () => useTopScorers('s1');
const useTopAssistsForS1 = () => useTopAssists('s1');
const useMatchStatisticsForM1 = () => useMatchStatistics('m1');
const useTeamStatsForM1 = () => useTeamStats('m1');

describe('javni web hookovi', () => {
  it.each([
    { name: 'strijelci', hook: useTopScorersForS1, path: '/statistics/top-scorers' },
    { name: 'asistencije', hook: useTopAssistsForS1, path: '/statistics/top-assists' },
    { name: 'pregled statistike', hook: useMatchStatisticsForM1, path: '/statistics/matches/m1/overview' },
    { name: 'timska statistika', hook: useTeamStatsForM1, path: '/statistics/matches/m1' },
  ])('$name se čita sa tačne putanje', async ({ hook, path }) => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => hook(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get.mock.calls[0][0]).toBe(path);
  });

  it('bez sezone ili utakmice upiti se ne pokreću', () => {
    const { wrapper } = setup();
    renderHook(() => useTopScorers(undefined), { wrapper });
    renderHook(() => useTopAssists(undefined), { wrapper });
    renderHook(() => useMatchStatistics(undefined), { wrapper });
    renderHook(() => useTeamStats(undefined), { wrapper });
    renderHook(() => useNewsForMatch(undefined), { wrapper });
    expect(api.get).not.toHaveBeenCalled();
  });

  it('vijesti za utakmicu filtriraju po povezanoj utakmici (matchId i match.id)', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({
      data: [
        { id: 'n1', relatedMatches: [{ matchId: 'm1' }] },
        { id: 'n2', relatedMatches: [{ match: { id: 'm1' } }] },
        { id: 'n3', relatedMatches: [{ matchId: 'm2' }] },
        { id: 'n4' },
      ],
    });
    const { result } = renderHook(() => useNewsForMatch('m1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/news/published');
    expect(result.current.data?.map((n) => n.id)).toEqual(['n1', 'n2']);
  });

  it('vijesti za utakmicu rade i sa odgovorom koji nije niz', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: null });
    const { result } = renderHook(() => useNewsForMatch('m1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
