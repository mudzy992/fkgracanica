import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  usePendingLiveReports, useStartMatch, useHalftimeMatch, useResumeMatch, useSetStoppage,
  useSetLiveStream, useEndMatch, useFinishRegularTime, useStartExtraTime, useExtraTimeHalftime,
  useResumeExtraSecond, useFinishExtraTime, useStartPenalties, useEndAfterPenalties,
  useApproveMatchReport, useAddMatchEvent, useAddMatchComment,
} from './use-live-admin';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { api.get.mockReset(); api.post.mockReset(); api.patch.mockReset(); });

describe('live admin query i promjene faze utakmice', () => {
  it('učitava listu izvještaja na čekanju u zaseban cache', async () => {
    const { qc, wrapper } = setup();
    api.get.mockResolvedValue({ data: [{ id: 'match-1' }] });
    const { result } = renderHook(() => usePendingLiveReports(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/live/pending');
    expect(qc.getQueryData(['live', 'pending'])).toEqual([{ id: 'match-1' }]);
  });

  it.each([
    { hook: useStartMatch, action: 'start' },
    { hook: useHalftimeMatch, action: 'halftime' },
    { hook: useResumeMatch, action: 'resume' },
    { hook: useFinishRegularTime, action: 'regular-time/end' },
    { hook: useStartExtraTime, action: 'extra-time/start' },
    { hook: useExtraTimeHalftime, action: 'extra-time/halftime' },
    { hook: useResumeExtraSecond, action: 'extra-time/resume' },
    { hook: useFinishExtraTime, action: 'extra-time/end' },
    { hook: useStartPenalties, action: 'penalties/start' },
    { hook: useEndAfterPenalties, action: 'penalties/end' },
  ])('$action koristi ispravnu rutu i spaja potvrđeni rezultat u detaljni cache', async ({ hook, action }) => {
    const { qc, wrapper } = setup();
    qc.setQueryData(['matches', 'match-1'], { id: 'match-1', homeScore: 1, awayScore: 2 });
    qc.setQueryData(['matches', 'match-2'], { id: 'match-2', homeScore: 7 });
    qc.setQueryData(['matches', 'list'], [{ id: 'match-1' }]);
    api.post.mockResolvedValue({ data: { id: 'match-1', homeScore: 3 } });
    const { result } = renderHook(() => hook(), { wrapper });
    await act(async () => { await result.current.mutateAsync('match-1'); });
    expect(api.post).toHaveBeenCalledWith(`/live/matches/match-1/${action}`);
    expect(qc.getQueryData(['matches', 'match-1'])).toEqual({ id: 'match-1', homeScore: 3, awayScore: 2 });
    expect(qc.getQueryData(['matches', 'match-2'])).toEqual({ id: 'match-2', homeScore: 7 });
    expect(qc.getQueryState(['matches', 'list'])?.isInvalidated).toBe(true);
  });

  it('neuspješna promjena faze ne mijenja ni ne invalidira cache', async () => {
    const { qc, wrapper } = setup();
    qc.setQueryData(['matches', 'match-1'], { id: 'match-1', homeScore: 1 });
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockRejectedValue(new Error('409'));
    const { result } = renderHook(() => useStartMatch(), { wrapper });
    await act(async () => { await expect(result.current.mutateAsync('match-1')).rejects.toThrow('409'); });
    expect(qc.getQueryData(['matches', 'match-1'])).toEqual({ id: 'match-1', homeScore: 1 });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('nadoknada prenosi poluvrijeme i minute, a ručno uklanjanje streama šalje null', async () => {
    const { qc, wrapper } = setup();
    api.post.mockResolvedValue({ data: { id: 'match-1', stoppageMinutes: 0 } });
    api.patch.mockResolvedValue({ data: { id: 'match-1', liveStreamUrl: null } });
    const { result } = renderHook(() => ({ stoppage: useSetStoppage(), stream: useSetLiveStream() }), { wrapper });
    await act(async () => { await result.current.stoppage.mutateAsync({ matchId: 'match-1', half: 2, minutes: 0 }); });
    expect(api.post).toHaveBeenCalledWith('/live/matches/match-1/stoppage', { half: 2, minutes: 0 });
    await act(async () => { await result.current.stream.mutateAsync({ matchId: 'match-1', url: null }); });
    expect(api.patch).toHaveBeenCalledWith('/live/matches/match-1/stream', { url: null });
    expect(qc.getQueryData(['matches', 'match-1'])).toEqual({ id: 'match-1', stoppageMinutes: 0, liveStreamUrl: null });
  });

  it.each([
    { hook: useEndMatch, action: 'end' },
    { hook: useApproveMatchReport, action: 'approve' },
  ])('$action osvježava utakmice i izvještaje na čekanju', async ({ hook, action }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValue({ data: { id: 'match-1' } });
    const { result } = renderHook(() => hook(), { wrapper });
    await act(async () => { await result.current.mutateAsync('match-1'); });
    expect(api.post).toHaveBeenCalledWith(`/live/matches/match-1/${action}`);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['matches'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['live', 'pending'] });
  });

  it('događaj i komentar odvajaju matchId od tijela i invalidiraju samo odgovarajući detalj', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValue({ data: { id: 'fixture' } });
    const { result } = renderHook(() => ({ event: useAddMatchEvent(), comment: useAddMatchComment() }), { wrapper });
    await act(async () => { await result.current.event.mutateAsync({ matchId: 'match-1', type: 'GOAL', minute: 0, teamSide: 'home' }); });
    expect(api.post).toHaveBeenCalledWith('/live/matches/match-1/events', { type: 'GOAL', minute: 0, teamSide: 'home' });
    await act(async () => { await result.current.comment.mutateAsync({ matchId: 'match-2', message: 'Test', minute: 1 }); });
    expect(api.post).toHaveBeenCalledWith('/live/matches/match-2/comments', { message: 'Test', minute: 1 });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['matches', 'match-1'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['matches', 'match-2'] });
  });
});
