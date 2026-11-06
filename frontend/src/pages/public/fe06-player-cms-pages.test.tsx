import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayerDetailPage } from './PlayerDetailPage';
import { CmsDynamicPage } from './CmsDynamicPage';

const state = vi.hoisted(() => ({
  player: { data: undefined as unknown, isLoading: false, isError: false },
  apiGet: vi.fn(),
  seo: [] as Record<string, unknown>[],
  heroes: [] as Record<string, unknown>[],
  renderers: [] as string[],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, o?: Record<string, unknown>) => (o ? `${k}:${JSON.stringify(o)}` : k) }),
}));
vi.mock('../../hooks/use-club-public', () => ({ usePlayerPublic: () => state.player }));
vi.mock('../../../lib/api', () => ({ api: { get: (...a: unknown[]) => state.apiGet(...(a as [])) } }));
vi.mock('../../lib/api', () => ({ api: { get: (...a: unknown[]) => state.apiGet(...(a as [])) } }));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo.push(props);
    return null;
  },
}));
vi.mock('../../components/team/PlayerCinematicHero', () => ({
  PlayerCinematicHero: (props: Record<string, unknown>) => {
    state.heroes.push(props);
    return <div data-testid="player-hero" />;
  },
}));
vi.mock('./team/PlayerMatchHistory', () => ({
  PlayerMatchHistory: ({ playerId }: { playerId: string }) => (
    <div data-testid="match-history" data-player={playerId} />
  ),
}));
vi.mock('../../cms/PageRenderer', () => ({
  PageRenderer: ({ slug }: { slug: string }) => {
    state.renderers.push(slug);
    return <div data-testid="page-renderer" />;
  },
}));

const client = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const withRoute = (path: string, routePath: string, ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={client()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={routePath} element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

const playerPage = (path = '/igrac/p1') =>
  withRoute(path, '/igrac/:id', <PlayerDetailPage />);

const player = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  firstName: 'Amar',
  lastName: 'Hodžić',
  bio: 'Iskusan vezni igrač.',
  season: { name: '2025/26' },
  seasonStats: { appearances: 20, goals: 5, assists: 3, minutes: 1500, yellowCards: 2, redCards: 1 },
  careerTotals: { appearances: 100, goals: 20, assists: 10, minutes: 8000, yellowCards: 9, redCards: 1 },
  ...over,
});

describe('PlayerDetailPage', () => {
  beforeEach(() => {
    state.player = { data: undefined, isLoading: false, isError: false };
    state.seo = [];
    state.heroes = [];
  });

  it('dok se igrač učitava prikazuje skeletone', () => {
    state.player = { data: undefined, isLoading: true, isError: false };
    const { container } = playerPage();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(2);
  });

  it('greška prikazuje poruku', () => {
    state.player = { data: undefined, isLoading: false, isError: true };
    playerPage();
    expect(screen.getByText('pages.player.notFound')).toBeTruthy();
  });

  it('prikazuje hero, biografiju i statistiku sezone', () => {
    state.player = { data: player(), isLoading: false, isError: false };
    playerPage();
    expect(screen.getByTestId('player-hero')).toBeTruthy();
    expect(state.seo[0]).toEqual({ title: 'Amar Hodžić', description: 'Iskusan vezni igrač.' });
    expect(screen.getByText('pages.player.about')).toBeTruthy();
    expect(screen.getByText('home.season:{"name":"2025/26"}')).toBeTruthy();
    expect(screen.getByText('pages.player.career')).toBeTruthy();
    expect(screen.getByTestId('match-history').getAttribute('data-player')).toBe('p1');
  });

  it('bez biografije i sezone nema tih sekcija', () => {
    state.player = {
      data: player({ bio: null, season: null, seasonStats: null }),
      isLoading: false,
      isError: false,
    };
    playerPage();
    expect(screen.queryByText('pages.player.about')).toBeNull();
    expect(screen.queryByText(/home\.season/)).toBeNull();
    expect(screen.getByText('pages.player.career')).toBeTruthy();
  });

  it('nedostajuća statistika prikazuje nulu', () => {
    state.player = { data: player({ careerTotals: undefined }), isLoading: false, isError: false };
    const { container } = playerPage();
    expect(container.textContent).toContain('0');
    expect(state.seo[0].description).toBe('Iskusan vezni igrač.');
  });

  it('bio se koristi kao SEO opis samo kada postoji', () => {
    state.player = { data: player({ bio: null }), isLoading: false, isError: false };
    playerPage();
    expect(state.seo[0].description).toBeUndefined();
  });
});

describe('CmsDynamicPage', () => {
  beforeEach(() => {
    state.renderers = [];
  });

  it('bez slug-a ne renderira ništa', () => {
    const { container } = withRoute('/stranica', '/stranica', <CmsDynamicPage />);
    expect(container.textContent).toBe('');
    expect(state.renderers).toHaveLength(0);
  });

  it('sa slug-om prosljeđuje ga rendereru', () => {
    withRoute('/stranica/o-klubu', '/stranica/:slug', <CmsDynamicPage />);
    expect(screen.getByTestId('page-renderer')).toBeTruthy();
    expect(state.renderers).toEqual(['o-klubu']);
  });
});
