import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlatformStatusHero } from './platform-status/PlatformStatusHero';
import { MatchFinishedReadOnly } from './competition-hub/MatchFinishedReadOnly';
import { useNewsletterSubscribers, useUnsubscribeNewsletter } from '../../hooks/use-newsletter-admin';
import { useSearch } from '../../hooks/use-search';
import { useShowcase } from '../../hooks/use-showcase';
import { useClubPublic, usePlayerPublic } from '../../hooks/use-club-public';
import { useJoinMembershipOnline } from '../../hooks/use-membership-join';
import { usePlatformStatus } from '../../hooks/use-platform-status';

const state = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), page: vi.fn() }));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../lib/api', () => ({
  api: { get: (...a: unknown[]) => state.get(...a), post: (...a: unknown[]) => state.post(...a) },
}));
vi.mock('../../hooks/use-paginated-query', () => ({
  usePaginatedQuery: (...a: unknown[]) => state.page(...a),
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: (p: { open: boolean; title: string; children: React.ReactNode }) =>
    p.open ? <section><h2>{p.title}</h2>{p.children}</section> : null,
}));
vi.mock('./competition-hub/MatchHighlightsEditor', () => ({
  MatchHighlightsEditor: ({ matchId }: { matchId: string }) => <div data-testid="highlights">{matchId}</div>,
}));

const qc = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc()}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>
);

describe('PlatformStatusHero', () => {
  it('prikazuje prsten i četiri brojača', () => {
    const data = { overallPercent: 42, counted: 30, afterLaunch: 5, counts: { ready: 12, in_progress: 8 } };
    render(<PlatformStatusHero data={data as never} />);
    for (const text of ['42%', 't:admin.stanjeCounted', '30', '5', '12', '8', 't:admin.stanjeRingCaption']) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });
});

const finished = {
  id: 'm1', status: 'FINISHED', reportStatus: 'DRAFT', homeScore: 3, awayScore: 1,
  venue: 'Gradski stadion', scheduledAt: '2026-05-01T17:00:00.000Z', seasonId: 's1',
  homeClubId: 'k1', awayClubId: 'k2', minute: 90,
  homeClub: { name: 'FK Gračanica' }, awayClub: { name: 'FK Slavija' },
};

const renderFinished = (over: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <MatchFinishedReadOnly open onOpenChange={vi.fn()} match={{ ...finished, ...over } as never} canLive />
    </MemoryRouter>,
  );

describe('MatchFinishedReadOnly', () => {
  it('prikazuje rezultat, teren i zaključanu poruku', () => {
    renderFinished();
    expect(screen.getByRole('heading', { name: 't:admin.matchFinished.title' })).toBeInTheDocument();
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(document.body.textContent).toContain('3:1');
    expect(document.body.textContent).toContain('Gradski stadion');
    expect(screen.getByText('t:admin.matchFinished.locked')).toBeInTheDocument();
    expect(screen.getByTestId('highlights')).toHaveTextContent('m1');
  });

  it('nudi uređivanje izvještaja kad je dozvoljeno i izvještaj u nacrtu', () => {
    renderFinished();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/admin/matches/m1/report');
    expect(screen.getByRole('button', { name: 't:admin.matchFinished.editReport' })).toBeInTheDocument();
  });

  it('bez dozvole nema linka za izvještaj', () => {
    render(<MemoryRouter><MatchFinishedReadOnly open onOpenChange={vi.fn()} match={finished as never} canLive={false} /></MemoryRouter>);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('odobren izvještaj nema link', () => {
    renderFinished({ reportStatus: 'APPROVED' });
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('bez terena prikazuje crticu', () => {
    render(<MemoryRouter><MatchFinishedReadOnly open onOpenChange={vi.fn()} match={{ ...finished, venue: null } as never} canLive={false} /></MemoryRouter>);
    expect(document.body.textContent).toContain('—');
  });
});

describe('use-newsletter-admin', () => {
  it('subscribers prosljeđuje parametre paginacije', () => {
    state.page.mockReturnValue({ data: [] });
    const { result } = renderHook(() => useNewsletterSubscribers({ page: 2, search: 'a' }), { wrapper });
    expect(state.page).toHaveBeenCalledWith(['newsletter'], '/newsletter', { page: 2, search: 'a' });
    expect(result.current.data).toEqual([]);
  });

  it('subscribers rade i bez parametara', () => {
    state.page.mockReturnValue({ data: [] });
    renderHook(() => useNewsletterSubscribers(), { wrapper });
    expect(state.page).toHaveBeenCalledWith(['newsletter'], '/newsletter', { page: undefined, search: undefined });
  });

  it('unsubscribe šalje email i invalidira upit', async () => {
    state.post.mockResolvedValue({ data: { ok: true } });
    const client = qc();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const localWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>
    );
    const { result } = renderHook(() => useUnsubscribeNewsletter(), { wrapper: localWrapper });
    await result.current.mutateAsync('a@b.c');
    expect(state.post).toHaveBeenCalledWith('/newsletter/unsubscribe', { email: 'a@b.c' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['newsletter'] });
  });
});

describe('useSearch / useShowcase / useClubPublic / usePlayerPublic / usePlatformStatus', () => {
  it('useSearch ne upitava za kratak tekst i šalje parametre', async () => {
    state.get.mockResolvedValue({ data: { items: [] } });
    const { rerender } = renderHook(({ q }) => useSearch({ q, type: 'news', page: 1 }), { wrapper, initialProps: { q: 'a' } });
    expect(state.get).not.toHaveBeenCalled();
    rerender({ q: 'gracanica' });
    await waitFor(() => expect(state.get).toHaveBeenCalled());
    expect(state.get).toHaveBeenCalledWith('/search', { params: { q: 'gracanica', type: 'news', page: 1 } });
  });

  it('useShowcase dohvaća javni showcase', async () => {
    state.get.mockResolvedValue({ data: { modules: [] } });
    const { result } = renderHook(() => useShowcase(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual({ modules: [] }));
    expect(state.get).toHaveBeenCalledWith('/public/showcase');
  });

  it('useClubPublic ne upitava bez slug-a', () => {
    state.get.mockClear();
    renderHook(() => useClubPublic(''), { wrapper });
    expect(state.get).not.toHaveBeenCalled();
  });

  it('useClubPublic i usePlayerPublic koriste javne rute', async () => {
    state.get.mockResolvedValue({ data: { id: 'x' } });
    const club = renderHook(() => useClubPublic('fk-gracanica'), { wrapper });
    const player = renderHook(() => usePlayerPublic('p1'), { wrapper });
    await waitFor(() => expect(club.result.current.data).toEqual({ id: 'x' }));
    await waitFor(() => expect(player.result.current.data).toEqual({ id: 'x' }));
    expect(state.get).toHaveBeenCalledWith('/clubs/public/fk-gracanica');
    expect(state.get).toHaveBeenCalledWith('/players/p1/public');
  });

  it('usePlatformStatus poštuje enabled', async () => {
    state.get.mockResolvedValue({ data: { overallPercent: 1 } });
    const off = renderHook(() => usePlatformStatus(false), { wrapper });
    expect(off.result.current.fetchStatus).toBe('idle');
    const on = renderHook(() => usePlatformStatus(), { wrapper });
    await waitFor(() => expect(on.result.current.data).toEqual({ overallPercent: 1 }));
    expect(state.get).toHaveBeenCalledWith('/platform-status');
  });
});

describe('useJoinMembershipOnline', () => {
  it('šalje zahtjev za pridruživanje', async () => {
    state.post.mockResolvedValue({ data: { membership: { id: 'ms1' } } });
    const { result } = renderHook(() => useJoinMembershipOnline(), { wrapper });
    const out = await result.current.mutateAsync({ email: 'a@b.c', password: 'tajna123' });
    expect(state.post).toHaveBeenCalledWith('/membership/public/join', { email: 'a@b.c', password: 'tajna123' });
    expect(out).toEqual({ membership: { id: 'ms1' } });
  });
});
