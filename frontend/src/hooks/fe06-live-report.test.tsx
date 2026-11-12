import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useAddReportEvent, useDeleteReportEvent, useAddReportComment, useSubmitMatchReport,
} from './use-live-report';
import { useLiveStatsPopup } from './use-live-stats-popup';
import type { LiveStatItem } from '../lib/live-stats-feed';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

describe('izvještaj utakmice', () => {
  it('događaj se šalje bez matchId-a u tijelu i invalidira samo tu utakmicu', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValue({ data: { id: 'e1' } });
    const { result } = renderHook(() => useAddReportEvent(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ matchId: 'm1', type: 'GOAL', minute: 12, teamSide: 'home' });
    });
    expect(api.post).toHaveBeenCalledWith('/live/matches/m1/report/events', { type: 'GOAL', minute: 12, teamSide: 'home' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['matches', 'm1'] });
  });

  it('komentar se šalje bez matchId-a, a brisanje događaja ima tačnu putanju', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValue({ data: { id: 'c1' } });
    api.delete.mockResolvedValue({ data: { ok: true } });
    const comment = renderHook(() => useAddReportComment(), { wrapper });
    await act(async () => { await comment.result.current.mutateAsync({ matchId: 'm1', message: 'Gol!', minute: 30 }); });
    expect(api.post).toHaveBeenCalledWith('/live/matches/m1/report/comments', { message: 'Gol!', minute: 30 });
    const remove = renderHook(() => useDeleteReportEvent(), { wrapper });
    await act(async () => { await remove.result.current.mutateAsync({ matchId: 'm1', eventId: 'e1' }); });
    expect(api.delete).toHaveBeenCalledWith('/live/matches/m1/report/events/e1');
    expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual([['matches', 'm1'], ['matches', 'm1']]);
  });

  it('slanje izvještaja spaja odgovor u keš i osvježava listu na čekanju', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    qc.setQueryData(['matches', 'm1'], { id: 'm1', status: 'LIVE' });
    api.post.mockResolvedValue({ data: { id: 'm1', status: 'FINISHED' } });
    const { result } = renderHook(() => useSubmitMatchReport(), { wrapper });
    await act(async () => { await result.current.mutateAsync('m1'); });
    expect(api.post).toHaveBeenCalledWith('/live/matches/m1/report/submit');
    expect(qc.getQueryData(['matches', 'm1'])).toMatchObject({ id: 'm1', status: 'FINISHED' });
    expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual([['matches'], ['live', 'pending']]);
  });

  it('bez zapisa u kešu slanje upisuje dobijene podatke', async () => {
    const { qc, wrapper } = setup();
    api.post.mockResolvedValue({ data: { id: 'm9', status: 'FINISHED' } });
    const { result } = renderHook(() => useSubmitMatchReport(), { wrapper });
    await act(async () => { await result.current.mutateAsync('m9'); });
    expect(qc.getQueryData(['matches', 'm9'])).toEqual({ id: 'm9', status: 'FINISHED' });
  });
});

describe('useLiveStatsPopup', () => {
  const comparison = (id: string): LiveStatItem => ({
    kind: 'comparison', id, label: `Stat ${id}`, homeClub: 'Domaći', awayClub: 'Gosti', home: 1, away: 0,
  });
  const items: LiveStatItem[] = [comparison('s1'), comparison('s2')];

  it('bez stavki ne zakazuje ništa', () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useLiveStatsPopup([]));
      vi.advanceTimersByTime(200_000);
      expect(result.current.visible).toBe(false);
      expect(result.current.active).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('nakon prvog intervala prikazuje stavku, sakriva je i priprema sljedeću', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const { result } = renderHook(() => useLiveStatsPopup(items));
      expect(result.current.visible).toBe(false);
      act(() => { vi.advanceTimersByTime(45_000); });
      expect(result.current.visible).toBe(true);
      expect(result.current.active?.id).toBe('s1');
      act(() => { vi.advanceTimersByTime(8_000); });
      expect(result.current.visible).toBe(false);
      act(() => { vi.advanceTimersByTime(120_000); });
      expect(result.current.visible).toBe(true);
      expect(result.current.active?.id).toBe('s2');
    } finally {
      vi.useRealTimers();
      vi.restoreAllMocks();
    }
  });

  it('promjena liste resetuje prikaz i timere te se unmount čisti', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const { result, rerender, unmount } = renderHook(({ list }: { list: LiveStatItem[] }) => useLiveStatsPopup(list), {
        initialProps: { list: items },
      });
      act(() => { vi.advanceTimersByTime(45_000); });
      expect(result.current.visible).toBe(true);
      rerender({ list: [] });
      expect(result.current.visible).toBe(false);
      expect(result.current.active).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
      unmount();
    } finally {
      vi.useRealTimers();
      vi.restoreAllMocks();
    }
  });
});
