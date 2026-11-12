import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useContactMessages,
  useDeleteContact,
  useMarkAllContactRead,
  useMarkContactRead,
} from './use-contact-admin';
import {
  useH2H,
  usePlayerAnalytics,
  useTeamAnalytics,
  useVisitorGeo,
  useVisitorTotals,
  useVisitorTrend,
} from './use-analytics';
import {
  useAddNewsComment,
  useDeleteNewsComment,
  useNewsComments,
} from './use-news-comments';
import { useCreateMatchHighlight, useDeleteMatchHighlight } from './use-match-highlights';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../lib/api', () => ({ api: apiMock }));

let qc: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

const ok = (data: unknown) => Promise.resolve({ data });

beforeEach(() => {
  qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  apiMock.get.mockReset().mockImplementation(() => ok({}));
  apiMock.post.mockReset().mockImplementation(() => ok({}));
  apiMock.patch.mockReset().mockImplementation(() => ok({}));
  apiMock.delete.mockReset().mockImplementation(() => ok({}));
});

describe('use-contact-admin', () => {
  it('lista koristi paginirane parametre', async () => {
    apiMock.get.mockImplementation(() =>
      ok({ data: [{ id: 'c1' }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } }),
    );
    const { result } = renderHook(
      () => useContactMessages({ page: 2, search: 'upit', unreadOnly: true }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiMock.get).toHaveBeenCalledWith('/contact', {
      params: { page: 2, search: 'upit', unreadOnly: 'true' },
    });
    expect(result.current.data?.data).toHaveLength(1);
  });

  it('nepročitano se ne šalje kad je false', async () => {
    renderHook(() => useContactMessages(), { wrapper });
    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
    expect(apiMock.get).toHaveBeenCalledWith('/contact', {
      params: { page: undefined, search: undefined, unreadOnly: undefined },
    });
  });

  it('označavanje pročitanim radi patch i invalidira listu', async () => {
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useMarkContactRead(), { wrapper });
    await result.current.mutateAsync('c1');
    expect(apiMock.patch).toHaveBeenCalledWith('/contact/c1/read');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['contact'] });
  });

  it('označavanje svih i brisanje koriste odgovarajuće rute', async () => {
    const all = renderHook(() => useMarkAllContactRead(), { wrapper });
    await all.result.current.mutateAsync();
    expect(apiMock.patch).toHaveBeenCalledWith('/contact/read-all');

    const remove = renderHook(() => useDeleteContact(), { wrapper });
    await remove.result.current.mutateAsync('c9');
    expect(apiMock.delete).toHaveBeenCalledWith('/contact/c9');
  });
});

describe('use-analytics', () => {
  it('tim šalje seasonId kad postoji', async () => {
    renderHook(() => useTeamAnalytics('s1'), { wrapper });
    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
    expect(apiMock.get).toHaveBeenCalledWith('/analytics/team', { params: { seasonId: 's1' } });
  });

  it('tim bez sezone ne šalje parametre', async () => {
    renderHook(() => useTeamAnalytics(), { wrapper });
    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
    expect(apiMock.get).toHaveBeenCalledWith('/analytics/team', { params: undefined });
  });

  it('igrač se ne dohvaća bez id-a', async () => {
    const { result } = renderHook(() => usePlayerAnalytics(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(apiMock.get).not.toHaveBeenCalled();
  });

  it('igrač se dohvaća sa id-em', async () => {
    renderHook(() => usePlayerAnalytics('p1'), { wrapper });
    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
    expect(apiMock.get).toHaveBeenCalledWith('/analytics/players/p1');
  });

  it('h2h se ne dohvaća bez oba kluba ili kad su isti', async () => {
    const missing = renderHook(() => useH2H('a'), { wrapper });
    expect(missing.result.current.fetchStatus).toBe('idle');
    const same = renderHook(() => useH2H('a', 'a'), { wrapper });
    expect(same.result.current.fetchStatus).toBe('idle');
    expect(apiMock.get).not.toHaveBeenCalled();
  });

  it('h2h sa različitim klubovima šalje oba id-a', async () => {
    renderHook(() => useH2H('a', 'b'), { wrapper });
    await waitFor(() => expect(apiMock.get).toHaveBeenCalled());
    expect(apiMock.get).toHaveBeenCalledWith('/analytics/h2h', {
      params: { clubAId: 'a', clubBId: 'b' },
    });
  });

  it('posjetioci koriste zadati broj dana', async () => {
    renderHook(() => useVisitorTrend(7), { wrapper });
    renderHook(() => useVisitorTotals(14), { wrapper });
    renderHook(() => useVisitorGeo(90), { wrapper });
    await waitFor(() => expect(apiMock.get).toHaveBeenCalledTimes(3));
    expect(apiMock.get).toHaveBeenCalledWith('/public-analytics/trend', { params: { days: 7 } });
    expect(apiMock.get).toHaveBeenCalledWith('/public-analytics/totals', { params: { days: 14 } });
    expect(apiMock.get).toHaveBeenCalledWith('/public-analytics/geo', { params: { days: 90 } });
  });
});

describe('use-news-comments', () => {
  it('lista se normalizuje kroz asArray i traži po vijesti', async () => {
    apiMock.get.mockImplementation(() => ok({ items: [{ id: 'k1' }] }));
    const { result } = renderHook(() => useNewsComments('n1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiMock.get).toHaveBeenCalledWith('/news/n1/comments');
    expect(result.current.data).toHaveLength(1);
  });

  it('bez id-a vijesti ne dohvaća', () => {
    const { result } = renderHook(() => useNewsComments(''), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(apiMock.get).not.toHaveBeenCalled();
  });

  it('dodavanje i brisanje komentara', async () => {
    const add = renderHook(() => useAddNewsComment('n1'), { wrapper });
    await add.result.current.mutateAsync('Odlična utakmica');
    expect(apiMock.post).toHaveBeenCalledWith('/news/n1/comments', {
      content: 'Odlična utakmica',
    });

    const remove = renderHook(() => useDeleteNewsComment('n1'), { wrapper });
    await remove.result.current.mutateAsync('k1');
    expect(apiMock.delete).toHaveBeenCalledWith('/news/comments/k1');
  });
});

describe('use-match-highlights', () => {
  it('kreiranje šalje tijelo i invalidira utakmicu', async () => {
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useCreateMatchHighlight('m1'), { wrapper });
    await result.current.mutateAsync({ title: 'Golovi', youtubeUrl: 'https://youtu.be/x' });
    expect(apiMock.post).toHaveBeenCalledWith('/matches/m1/highlights', {
      title: 'Golovi',
      youtubeUrl: 'https://youtu.be/x',
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['matches', 'm1'] });
  });

  it('brisanje ide na tačan highlight', async () => {
    const { result } = renderHook(() => useDeleteMatchHighlight('m1'), { wrapper });
    await result.current.mutateAsync('h1');
    expect(apiMock.delete).toHaveBeenCalledWith('/matches/m1/highlights/h1');
  });
});
