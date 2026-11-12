import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

describe('fe06-batch69d LeaguePage true grana [prev && calendars.some]', () => {
  it('zadržava prethodni calendarId kada i dalje postoji u listi [0,17]', async () => {
    const { rerender } = renderInRouter(<LeaguePage />);
    // početni calendarId je s1 (pickDefaultCalendarId)
    expect(state.filter.seasonId).toBe('s1');
    // dodaj novu sezonu s3 ali zadrži s1
    state.seasons = {
      data: [
        season({ id: 's1', name: '2025/26', yearStart: 2025, isActive: true }),
        season({ id: 's3', name: '2026/27', yearStart: 2026, isActive: false }),
      ],
      isLoading: false,
    } as never;
    rerender(
      <MemoryRouter>
        <LeaguePage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(state.filter.seasonId).toBe('s1'));
    // standings poziv treba ostati sa ed1 (iz s1), ne ed iz s3
    expect(state.calls.some((c) => c.hook === 'standings' && (c.args as { editionId?: string }).editionId === 'ed1')).toBe(true);
  });

  it('pokriva calendars ?? [] i matches ?? [] kada su undefined', async () => {
    state.seasons = { data: undefined as never, isLoading: false };
    state.matches = { data: undefined as never, isLoading: false };
    renderInRouter(<LeaguePage />);
    await waitFor(() => expect(screen.getByText(/hero:/)).toBeInTheDocument());
    expect(state.calls.some((c) => c.hook === 'rounds' && (c.args as { seasonId?: string }).seasonId === undefined)).toBe(true);
  });
});
