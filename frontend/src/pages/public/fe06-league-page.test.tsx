import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeaguePage } from './LeaguePage';
import {
  leaguePageState as state,
  leagueSeason as season,
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

describe('LeaguePage — učitavanje i selekcija', () => {
  it('dok se sezone učitavaju prikazuje skeleton bez filtera', () => {
    state.seasons = { data: [], isLoading: true };
    renderInRouter(<LeaguePage />);
    expect(screen.getAllByText('skeleton').length).toBeGreaterThan(0);
    expect(screen.queryByText(/^filter:/)).toBeNull();
  });

  it('bira aktivnu sezonu i njenu ligu kao ediciju', () => {
    renderInRouter(<LeaguePage />);
    expect(state.calls).toContainEqual({ hook: 'rounds', args: { seasonId: 'ed1' } });
    expect(state.calls).toContainEqual({ hook: 'matches', args: { editionId: 'ed1' } });
    expect(screen.getByText('hero:2025/26:2')).toBeInTheDocument();
    expect(screen.getByText('filter:1:s1')).toBeInTheDocument();
  });

  it('promjena sezone resetuje kolo natrag na ukupnu tabelu', async () => {
    const user = userEvent.setup();
    state.seasons = {
      data: [
        season({ id: 's1', name: '2024/25', yearStart: 2024, isActive: false }),
        season({ id: 's2', name: '2025/26', yearStart: 2025, isActive: true }),
      ],
      isLoading: false,
    };
    renderInRouter(<LeaguePage />);
    await user.click(screen.getByRole('button', { name: 'kolo-3' }));
    await waitFor(() => expect(screen.getByText(/tabela:pages.league.tableToRound/)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'promijeni-sezonu' }));
    await waitFor(() =>
      expect(screen.getByText(/tabela:pages.league.overallTable/)).toBeInTheDocument(),
    );
  });

  it('izbor kola mijenja naslov tabele i parametre upita', async () => {
    const user = userEvent.setup();
    renderInRouter(<LeaguePage />);
    await user.click(screen.getByRole('button', { name: 'kolo-3' }));
    await waitFor(() => expect(screen.getByText(/tabela:pages.league.tableToRound/)).toBeInTheDocument());
    expect(state.calls).toContainEqual({ hook: 'standings', args: { editionId: 'ed1', upToRound: 3 } });
    await user.click(screen.getByRole('button', { name: 'sva-kola' }));
    await waitFor(() =>
      expect(screen.getByText(/tabela:pages.league.overallTable/)).toBeInTheDocument(),
    );
  });

  it('sezona bez aktivne i bez lige pada na prvu ediciju', () => {
    state.seasons = {
      data: [
        season({
          id: 's3',
          name: '2023/24',
          isActive: false,
          competitions: [{ id: 'ed9', competition: { name: 'Kup', isLeague: false } }],
        }),
      ],
      isLoading: false,
    };
    renderInRouter(<LeaguePage />);
    expect(state.calls).toContainEqual({ hook: 'matches', args: { editionId: 'ed9' } });
  });

  it('sezona bez takmičenja nema ediciju i traži prazne podatke', () => {
    state.seasons = { data: [season({ competitions: [] })], isLoading: false };
    renderInRouter(<LeaguePage />);
    expect(state.calls).toContainEqual({ hook: 'matches', args: { editionId: undefined } });
  });
});

describe('LeaguePage — nestanak odabrane sezone', () => {
  it('bira novu aktivnu sezonu kad prethodna nestane iz liste', async () => {
    const { rerender } = renderInRouter(<LeaguePage />);
    expect(state.calls).toContainEqual({ hook: 'standings', args: { editionId: 'ed1', upToRound: null } });
    state.seasons = {
      data: [season({ id: 's9', name: '2026/27', yearStart: 2026, competitions: [{ id: 'ed9', competition: { name: 'Liga', isLeague: true } }] })],
      isLoading: false,
    };
    rerender(<MemoryRouter><LeaguePage /></MemoryRouter>);
    await waitFor(() =>
      expect(state.calls).toContainEqual({ hook: 'standings', args: { editionId: 'ed9', upToRound: null } }),
    );
  });
});
