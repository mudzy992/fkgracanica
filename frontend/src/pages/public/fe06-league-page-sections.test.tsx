import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeaguePage } from './LeaguePage';
import {
  leaguePageState as state,
  leagueStanding as standing,
  renderInRouter,
  resetLeaguePageState,
} from '../../test/doubles/league-page-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', async () => (await import('../../test/doubles/league-page-doubles')).leagueHooksModule());
vi.mock('../../hooks/use-rounds', async () => (await import('../../test/doubles/league-page-doubles')).leagueRoundHooksModule());
vi.mock('../../components/seo/Seo', async () => (await import('../../test/doubles/league-page-doubles')).leagueSeoModule());
vi.mock('../../components/ui/skeleton', async () => (await import('../../test/doubles/league-page-doubles')).leagueSkeletonModule());
vi.mock('../../components/common/DataError', async () => (await import('../../test/doubles/league-page-doubles')).leagueDataErrorModule());
vi.mock('../../components/public/league/LeagueCinematicHero', async () => (await import('../../test/doubles/league-page-doubles')).leagueHeroModule());
vi.mock('../../components/public/league/LeagueFilterBar', async () => (await import('../../test/doubles/league-page-doubles')).leagueFilterBarModule());
vi.mock('../../components/public/league/LeagueStandingsSection', async () => (await import('../../test/doubles/league-page-doubles')).leagueStandingsModule());
vi.mock('../../components/public/league/LeagueResultsRound', async () => (await import('../../test/doubles/league-page-doubles')).leagueResultsModule());
vi.mock('../../components/public/league/LeagueTopScorers', async () => (await import('../../test/doubles/league-page-doubles')).leagueTopScorersModule());
vi.mock('../../components/public/league/LeagueNextMatch', async () => (await import('../../test/doubles/league-page-doubles')).leagueNextMatchModule());
vi.mock('../../components/public/league/LeagueLiveMatches', async () => (await import('../../test/doubles/league-page-doubles')).leagueLiveMatchesModule());

beforeEach(() => {
  resetLeaguePageState();
});

describe('LeaguePage — tabele, pomaci i greške', () => {
  it('pomaci se računaju samo uz prethodno kolo i obje tabele', () => {
    renderInRouter(<LeaguePage />);
    expect(screen.getByText(/bez-pomaka/)).toBeInTheDocument();
  });

  it('sa najmanje dva odigrana kola računa pomake i ističe vlastiti klub', () => {
    state.matches = {
      data: [{ id: 'm1', status: 'FINISHED', roundRel: { number: 3 } }],
      isLoading: false,
    };
    state.prevStandings = [standing('c2'), standing('c1')];
    renderInRouter(<LeaguePage />);
    expect(screen.getByText(/pomaci:c1/)).toBeInTheDocument();
  });

  it('greška tabele prikazuje retry koji ponovo traži podatke', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    state.standings = { ...state.standings, isError: true, refetch };
    renderInRouter(<LeaguePage />);
    await user.click(screen.getByRole('button', { name: 'retry-tabela' }));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(state.errorRetried).toBe(1);
  });

  it('dok se strijelci učitavaju prikazuje skeleton umjesto sekcije', () => {
    state.scorers = { data: [], isLoading: true };
    renderInRouter(<LeaguePage />);
    expect(screen.queryByText(/^strijelci:/)).toBeNull();
  });

  it('kad su strijelci učitani sekcija dobija oba niza', () => {
    renderInRouter(<LeaguePage />);
    expect(screen.getByText('strijelci:1')).toBeInTheDocument();
    expect(state.topScorers).toMatchObject({ assists: [{ id: 'p2' }] });
  });

  it('utakmice se prosljeđuju rezultatima, sljedećoj i uživo sekciji', () => {
    renderInRouter(<LeaguePage />);
    expect(screen.getByText('rezultati:1:false')).toBeInTheDocument();
    expect(screen.getByText('sljedeća:1')).toBeInTheDocument();
    expect(screen.getByText('uživo:1')).toBeInTheDocument();
  });

  it('SEO naslov sadrži naziv aktivne sezone', () => {
    renderInRouter(<LeaguePage />);
    expect(screen.getByText(/^seo:pages.league.seoTitle/)).toBeInTheDocument();
    expect(state.hero).toMatchObject({ teamCount: 2, leaderName: 'Klub c1' });
  });
});
