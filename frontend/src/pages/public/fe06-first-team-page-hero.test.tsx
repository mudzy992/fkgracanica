import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FirstTeamPage } from './FirstTeamPage';

const state = vi.hoisted(() => ({
  club: { data: undefined as unknown, isLoading: false },
  squad: { data: undefined as unknown, isLoading: false, isError: false },
  refetch: vi.fn(),
  stats: undefined as unknown,
  roster: {} as Record<string, unknown>,
  spotlight: {} as Record<string, unknown>,
  formation: {} as Record<string, unknown>,
  hero: {} as Record<string, unknown>,
  seasonStatsClubId: null as string | null,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-club-hub', () => ({
  useClubSquad: (id: string) => ({ ...state.squad, refetch: state.refetch, id }),
  useClubStats: () => ({ data: state.stats }),
}));
vi.mock('../../hooks', () => ({
  useOwnClub: () => state.club,
}));
vi.mock('../../components/team/TeamCinematicHero', () => ({
  TeamCinematicHero: (props: Record<string, unknown>) => {
    state.hero = props;
    return (
      <div>
        hero:{String((props.club as { name?: string } | undefined)?.name ?? '-')}:
        {String(props.stadiumName ?? '-')}:{String(props.city ?? '-')}
      </div>
    );
  },
}));
vi.mock('../../components/team/TeamFormationSection', () => ({
  TeamFormationSection: (props: Record<string, unknown>) => {
    state.formation = props;
    return <div>formacija</div>;
  },
}));
vi.mock('../../components/team/TeamSpotlight', () => ({
  TeamSpotlight: (props: Record<string, unknown>) => {
    state.spotlight = props;
    return <div>spotlight:{(props.players as unknown[]).length}</div>;
  },
}));
vi.mock('../../components/team/TeamRosterSections', () => ({
  TeamRosterSections: (props: Record<string, unknown>) => {
    state.roster = props;
    return (
      <div>
        rostera:{(props.bench as unknown[]).length}:{(props.squadPlayers as unknown[]).length}
      </div>
    );
  },
}));
vi.mock('../../components/team/TeamSeasonStatsSection', () => ({
  TeamSeasonStatsSection: ({ clubId }: { clubId: string }) => {
    state.seasonStatsClubId = clubId;
    return <div>sezona-stat:{clubId}</div>;
  },
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
  Skeleton: () => <div data-testid="skeleton" />,
}));
vi.mock('../../components/common/DataError', () => ({
  DataError: ({ onRetry }: { onRetry?: () => void }) => (
    <div>
      greška
      <button onClick={onRetry}>pokušaj</button>
    </div>
  ),
}));

const player = (id: string) => ({ id, firstName: id, lastName: 'Igrač' });
const slot = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  isBench: false,
  player: player('p1'),
  ...over,
});

const club = (over: Record<string, unknown> = {}) => ({
  id: 'c1',
  name: 'FK Gračanica',
  description: 'Opis kluba',
  stadium: 'Stadion Luke',
  city: 'Gračanica',
  stadiumRel: { name: 'Stadion Luke', city: 'Gračanica' },
  ...over,
});

beforeEach(() => {
  state.club = { data: club(), isLoading: false };
  state.squad = { data: { slots: [slot()] }, isLoading: false, isError: false };
  state.refetch.mockReset();
  state.stats = { p1: { goals: 3 } };
  state.roster = {};
  state.spotlight = {};
  state.formation = {};
  state.hero = {};
  state.seasonStatsClubId = null;
});

describe('FirstTeamPage — hero i SEO', () => {
  it('hero dobija naziv stadiona i grad iz relacije', () => {
    render(<FirstTeamPage />);
    expect(screen.getByText('hero:FK Gračanica:Stadion Luke:Gračanica')).toBeInTheDocument();
    expect(screen.getByText('seo:Prvi tim — FK Gračanica:Opis kluba')).toBeInTheDocument();
  });

  it('bez relacije koristi polja kluba', () => {
    state.club = { data: club({ stadiumRel: null }), isLoading: false };
    render(<FirstTeamPage />);
    expect(screen.getByText('hero:FK Gračanica:Stadion Luke:Gračanica')).toBeInTheDocument();
  });

  it('bez kluba koristi podrazumijevani SEO naslov', () => {
    state.club = { data: undefined, isLoading: false };
    state.squad = { data: { slots: [] }, isLoading: false, isError: false };
    render(<FirstTeamPage />);
    expect(screen.getByText('seo:Prvi tim:Kadrovi prvog tima')).toBeInTheDocument();
  });
});
