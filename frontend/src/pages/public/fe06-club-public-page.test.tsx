import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubPublicPage } from './ClubPublicPage';

const state = vi.hoisted(() => ({
  club: { data: undefined as unknown, isLoading: false, isError: false },
  slug: '',
  moduleFlags: undefined as unknown,
  competition: {} as Record<string, unknown>,
  roster: {} as Record<string, unknown>,
  grid: {} as Record<string, unknown>,
  hero: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-club-public', () => ({
  useClubPublic: (slug: string) => {
    state.slug = slug;
    return state.club;
  },
}));
vi.mock('../../hooks', () => ({
  useModuleFlags: () => ({ data: state.moduleFlags }),
}));
vi.mock('../../lib/module-settings-rules', () => ({
  isModuleEnabled: (flags: Record<string, unknown> | undefined, key: string) =>
    !flags || flags[key] !== false,
}));
vi.mock('../../components/public/clubs/ClubCinematicHero', () => ({
  ClubCinematicHero: (props: Record<string, unknown>) => {
    state.hero = props;
    return <div>hero:{String((props.club as { name?: string }).name)}</div>;
  },
}));
vi.mock('../../components/public/clubs/ClubInfoSection', () => ({
  ClubInfoSection: ({ stadium }: { stadium: { name: string } }) => <div>stadion:{stadium.name}</div>,
}));
vi.mock('../../components/public/clubs/ClubPublicSections', () => ({
  ClubPlayersGrid: (props: Record<string, unknown>) => {
    state.grid = props;
    return <div>mreza:{(props.players as unknown[]).length}</div>;
  },
}));
vi.mock('../../components/public/clubs/ClubCompetitionTabs', () => ({
  ClubCompetitionTabs: (props: Record<string, unknown>) => {
    state.competition = props;
    return <div>takmicenja:{(props.participations as unknown[]).length}</div>;
  },
}));
vi.mock('../../components/team/TeamFormationSection', () => ({
  TeamFormationSection: () => <div>formacija</div>,
}));
vi.mock('../../components/team/TeamRosterSections', () => ({
  TeamRosterSections: (props: Record<string, unknown>) => {
    state.roster = props;
    return <div>rostera:{(props.bench as unknown[]).length}:{(props.squadPlayers as unknown[]).length}</div>;
  },
}));
vi.mock('../../components/team/TeamSpotlight', () => ({
  TeamSpotlight: ({ players }: { players: unknown[] }) => <div>spotlight:{players.length}</div>,
}));
vi.mock('../../components/team/TeamSeasonStats', () => ({
  TeamSeasonStats: ({ stats }: { stats?: unknown }) => <div>sezona:{stats ? 'da' : 'ne'}</div>,
}));
vi.mock('../../components/team/team-stats-utils', () => ({
  spotlightPlayers: (stats: unknown, players: unknown[]) => (stats ? players.slice(0, 2) : []),
  statsByPlayerId: (stats: unknown) => ({ map: stats }),
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title, description }: { title: string; description: string }) => (
    <div>
      seo:{title}:{description}
    </div>
  ),
}));
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" data-class={className} />,
}));

const player = (id: string) => ({ id, firstName: id, lastName: 'Igrač' });
const slot = (over: Record<string, unknown> = {}) => ({ id: 's1', isBench: false, player: player('p1'), ...over });

const clubData = (over: Record<string, unknown> = {}) => ({
  club: { id: 'c1', name: 'FK Gračanica', description: 'Opis kluba' },
  stadium: { name: 'Stadion Luke' },
  squad: { slots: [slot(), slot({ id: 's2', isBench: true, player: player('p2') })] },
  seasonStats: { p1: { goals: 2 } },
  players: [player('p1'), player('p2'), player('p3')],
  participations: [],
  ...over,
});

const renderPage = (slug = 'fk-gracanica') =>
  render(
    <MemoryRouter initialEntries={[`/klubovi/${slug}`]}>
      <Routes>
        <Route path="/klubovi/:slug" element={<ClubPublicPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.club = { data: clubData(), isLoading: false, isError: false };
  state.slug = '';
  state.moduleFlags = { 'modules.competitions': true };
  state.competition = {};
  state.roster = {};
  state.grid = {};
  state.hero = {};
});

describe('ClubPublicPage — učitavanje i greške', () => {
  it('dok se klub učitava prikazuje tri skeletona', () => {
    state.club = { data: undefined, isLoading: true, isError: false };
    renderPage();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
    expect(screen.queryByText(/hero:/)).toBeNull();
  });

  it('nepoznat klub prikazuje poruku', () => {
    state.club = { data: undefined, isLoading: false, isError: false };
    renderPage();
    expect(screen.getByText('pages.club.notFound')).toBeInTheDocument();
  });

  it('greška prikazuje istu poruku i koristi slug iz rute', () => {
    state.club = { data: undefined, isLoading: false, isError: true };
    renderPage('nk-zenica');
    expect(screen.getByText('pages.club.notFound')).toBeInTheDocument();
    expect(state.slug).toBe('nk-zenica');
  });
});

describe('ClubPublicPage — sastav i statistika', () => {
  it('prikazuje hero, stadion, formaciju, spotlight i roster', () => {
    renderPage();
    expect(screen.getByText('hero:FK Gračanica')).toBeInTheDocument();
    expect(screen.getByText('stadion:Stadion Luke')).toBeInTheDocument();
    expect(screen.getByText('formacija')).toBeInTheDocument();
    expect(screen.getByText('spotlight:2')).toBeInTheDocument();
    expect(screen.getByText('rostera:1:1')).toBeInTheDocument();
    expect(screen.getByText('sezona:da')).toBeInTheDocument();
  });

  it('SEO koristi naziv i opis kluba', () => {
    renderPage();
    expect(screen.getByText('seo:FK Gračanica:Opis kluba')).toBeInTheDocument();
  });

  it('bez opisa koristi generički opis', () => {
    state.club.data = clubData({ club: { id: 'c2', name: 'NK Zenica', description: null } });
    renderPage();
    expect(screen.getByText('seo:NK Zenica:Profil kluba NK Zenica')).toBeInTheDocument();
  });

  it('bez stadiona nema info sekcije', () => {
    state.club.data = clubData({ stadium: null });
    renderPage();
    expect(screen.queryByText(/stadion:/)).toBeNull();
  });

  it('bez sastava ali sa igračima prikazuje mrežu igrača', () => {
    state.club.data = clubData({ squad: undefined });
    renderPage();
    expect(screen.getByText('mreza:3')).toBeInTheDocument();
    expect(state.grid.stats).toEqual({ p1: { goals: 2 } });
    expect(screen.queryByText('formacija')).toBeNull();
  });

  it('prazan sastav i prazna lista igrača daju poruku', () => {
    state.club.data = clubData({ squad: { slots: [] }, players: [] });
    renderPage();
    expect(screen.getByText('pages.club.squadEmpty')).toBeInTheDocument();
  });

  it('sastav bez statistike nema spotlight', () => {
    state.club.data = clubData({ seasonStats: null });
    renderPage();
    expect(screen.queryByText(/spotlight:/)).toBeNull();
    expect(screen.getByText('sezona:ne')).toBeInTheDocument();
  });
});

describe('ClubPublicPage — takmičenja', () => {
  it('prikazuje tabove takmičenja kad ih ima i modul je uključen', () => {
    state.club.data = clubData({ participations: [{ seasonId: 's1' }, { seasonId: 's2' }] });
    renderPage();
    expect(screen.getByText('takmicenja:2')).toBeInTheDocument();
    expect(state.competition.clubId).toBe('c1');
  });

  it('isključen modul skriva tabove i kad ima participacija', () => {
    state.moduleFlags = { 'modules.competitions': false };
    state.club.data = clubData({ participations: [{ seasonId: 's1' }] });
    renderPage();
    expect(screen.queryByText(/takmicenja:/)).toBeNull();
  });
});
