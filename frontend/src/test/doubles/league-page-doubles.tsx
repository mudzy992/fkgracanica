import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

/** Zajedničko stanje, dvojnici i reset za LeaguePage testove (dva fajla). */
type Args = Record<string, unknown>;

export const leaguePageState = {
  ownClub: undefined as { id: string } | undefined,
  seasons: { data: [] as unknown[], isLoading: false },
  standings: { data: [] as unknown[], isLoading: false, isError: false, refetch: () => {} },
  prevStandings: [] as unknown[],
  scorers: { data: [] as unknown[], isLoading: false },
  assists: { data: [] as unknown[], isLoading: false },
  matches: { data: [] as unknown[], isLoading: false },
  rounds: { data: [] as unknown[] },
  calls: [] as Array<{ hook: string; args: Args }>,
  hero: {} as Args,
  filter: {} as Args,
  standingsSection: {} as Args,
  topScorers: {} as Args,
  results: {} as Args,
  errorRetried: 0,
};

export const leagueSeason = (over: Args = {}) => ({
  id: 's1',
  name: '2025/26',
  yearStart: 2025,
  isActive: true,
  competitions: [{ id: 'ed1', competition: { name: 'Kantonalna liga', isLeague: true } }],
  ...over,
});

export const leagueStanding = (clubId: string, over: Args = {}) => ({
  clubId,
  clubName: `Klub ${clubId}`,
  points: 10,
  ...over,
});

export function resetLeaguePageState() {
  leaguePageState.ownClub = { id: 'c1' };
  leaguePageState.seasons = { data: [leagueSeason()], isLoading: false };
  leaguePageState.standings = {
    data: [leagueStanding('c1'), leagueStanding('c2')],
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  leaguePageState.scorers = { data: [{ id: 'p1' }], isLoading: false };
  leaguePageState.assists = { data: [{ id: 'p2' }], isLoading: false };
  leaguePageState.matches = {
    data: [{ id: 'm1', status: 'FINISHED', roundRel: { number: 2 } }],
    isLoading: false,
  };
  leaguePageState.rounds = { data: [{ id: 'r1' }] };
  leaguePageState.calls = [];
  leaguePageState.hero = {};
  leaguePageState.filter = {};
  leaguePageState.standingsSection = {};
  leaguePageState.topScorers = {};
  leaguePageState.results = {};
  leaguePageState.prevStandings = [];
  leaguePageState.errorRetried = 0;
}

/** Bez uvoza same stranice — inače nastaje ciklus sa mock fabrikama. */
export const renderInRouter = (node: ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

export function leagueHooksModule() {
  const state = leaguePageState;
  return {
    useOwnClub: () => ({ data: state.ownClub }),
    useSeasons: () => state.seasons,
    useStandings: (editionId?: string, upToRound?: number | null) => {
      state.calls.push({ hook: 'standings', args: { editionId, upToRound } });
      return upToRound === null || upToRound === undefined
        ? state.standings
        : { ...state.standings, data: state.prevStandings };
    },
    useTopScorers: () => state.scorers,
    useTopAssists: () => state.assists,
    useMatches: (editionId?: string) => {
      state.calls.push({ hook: 'matches', args: { editionId } });
      return state.matches;
    },
  };
}

export function leagueRoundHooksModule() {
  return {
    useRounds: (seasonId?: string) => {
      leaguePageState.calls.push({ hook: 'rounds', args: { seasonId } });
      return leaguePageState.rounds;
    },
  };
}

export function leagueSeoModule() {
  return { Seo: ({ title }: { title: string }) => <div>seo:{title}</div> };
}
export function leagueSkeletonModule() {
  return { Skeleton: () => <div>skeleton</div> };
}

export function leagueDataErrorModule() {
  return {
    DataError: ({ onRetry }: { onRetry: () => void }) => (
      <div>
        greška-tabele
        <button
          onClick={() => {
            leaguePageState.errorRetried += 1;
            onRetry();
          }}
        >
          retry-tabela
        </button>
      </div>
    ),
  };
}

export function leagueHeroModule() {
  return {
    LeagueCinematicHero: (props: Args) => {
      leaguePageState.hero = props;
      return (
        <div>
          hero:{(props.season as { name?: string } | undefined)?.name ?? '-'}:{String(props.roundsPlayed)}
        </div>
      );
    },
  };
}

export function leagueFilterBarModule() {
  return {
    LeagueFilterBar: (props: Args) => {
      leaguePageState.filter = props;
      return (
        <div>
          <span>
            filter:{(props.seasons as unknown[]).length}:{String(props.seasonId)}
          </span>
          <button onClick={() => (props.onSeasonChange as (id: string) => void)('s1')}>promijeni-sezonu</button>
          <button onClick={() => (props.onRoundChange as (r: number | null) => void)(3)}>kolo-3</button>
          <button onClick={() => (props.onRoundChange as (r: number | null) => void)(null)}>sva-kola</button>
        </div>
      );
    },
  };
}

export function leagueStandingsModule() {
  return {
    LeagueStandingsSection: (props: Args) => {
      leaguePageState.standingsSection = props;
      return (
        <div>
          tabela:{String(props.title)}:{(props.rows as unknown[]).length}:{String(props.loading)}:
          {props.positionChanges ? 'pomaci' : 'bez-pomaka'}:{String(props.highlightClubId ?? '-')}
        </div>
      );
    },
  };
}

export function leagueResultsModule() {
  return {
    LeagueResultsRound: (props: Args) => {
      leaguePageState.results = props;
      return (
        <div>
          rezultati:{(props.matches as unknown[]).length}:{String(props.loading)}
        </div>
      );
    },
  };
}

export function leagueTopScorersModule() {
  return {
    LeagueTopScorers: (props: Args) => {
      leaguePageState.topScorers = props;
      return <div>strijelci:{(props.scorers as unknown[] | undefined)?.length ?? 0}</div>;
    },
  };
}

export function leagueNextMatchModule() {
  return { LeagueNextMatch: ({ matches }: { matches: unknown[] }) => <div>sljedeća:{matches.length}</div> };
}
export function leagueLiveMatchesModule() {
  return { LeagueLiveMatches: ({ matches }: { matches: unknown[] }) => <div>uživo:{matches.length}</div> };
}
