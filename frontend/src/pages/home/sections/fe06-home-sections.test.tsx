import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Newsletter } from './Newsletter';
import { LeagueTable } from './LeagueTable';

const state = vi.hoisted(() => ({
  subscribe: {
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null as unknown,
  },
  seasons: undefined as unknown,
  seasonsLoading: false,
  standings: [] as unknown[],
  standingsLoading: false,
  standingsArg: undefined as unknown,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../../hooks', () => ({
  useSubscribeNewsletter: () => state.subscribe,
  useSeasons: () => ({ data: state.seasons, isLoading: state.seasonsLoading }),
  useStandings: (id?: string) => {
    state.standingsArg = id;
    return { data: state.standings, isLoading: state.standingsLoading };
  },
}));

beforeEach(() => {
  state.subscribe = {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    isError: false,
    error: null,
  };
  state.seasons = undefined;
  state.seasonsLoading = false;
  state.standings = [];
  state.standingsLoading = false;
  state.standingsArg = undefined;
});

describe('Newsletter (home)', () => {
  it('prikazuje naslov, opis i polje', () => {
    render(<Newsletter />);
    expect(screen.getByRole('heading', { name: 't:home.newsletter' })).toBeInTheDocument();
    expect(screen.getByText('t:home.newsletterDesc')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('t:common.email')).toBeInTheDocument();
  });

  it('uspješna prijava zahvaljuje i čisti polje', async () => {
    render(<Newsletter />);
    await userEvent.type(screen.getByPlaceholderText('t:common.email'), 'a@b.ba');
    await userEvent.click(screen.getByRole('button', { name: 't:actions.subscribe' }));
    expect(state.subscribe.mutateAsync).toHaveBeenCalledWith('a@b.ba');
    expect(screen.getByText('t:home.newsletterThanks')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('t:common.email')).toBeNull();
  });

  it('greška prikazuje prevedeni rezervni tekst', () => {
    state.subscribe = {
      mutateAsync: vi.fn(),
      isPending: true,
      isError: true,
      error: null,
    };
    render(<Newsletter />);
    expect(screen.getByText('t:home.newsletterError')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 't:actions.subscribe' })).toBeDisabled();
  });

  it('greška sa porukom prikazuje samu poruku', () => {
    state.subscribe = {
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      error: new Error('Adresa je odbijena'),
    };
    render(<Newsletter />);
    expect(screen.getByText('Adresa je odbijena')).toBeInTheDocument();
  });
});

describe('LeagueTable (home)', () => {
  const season = {
    id: 's1',
    name: 'Sezona 2025/26',
    isActive: true,
    yearStart: 2025,
    yearEnd: 2026,
    competitions: [
      { id: 'e1', competitionId: 'c1', competition: { id: 'c1', name: 'Premijer liga', isLeague: true } },
    ],
  };
  const row = {
    clubId: 'k1',
    clubName: 'FK Gračanica',
    played: 10,
    won: 6,
    drawn: 2,
    lost: 2,
    goalsFor: 18,
    goalsAgainst: 9,
    points: 20,
  };

  it('dok se učitava prikazuje skeleton', () => {
    state.seasonsLoading = true;
    const { container } = render(<LeagueTable />);
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('prikazuje tabelu sa redovima', () => {
    state.seasons = [season];
    state.standings = [row];
    render(<LeagueTable />);
    expect(screen.getByRole('heading', { name: 't:home.leagueTable' })).toBeInTheDocument();
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(state.standingsArg).toBe('e1');
  });

  it('prazna tabela prikazuje poruku', () => {
    state.seasons = [];
    render(<LeagueTable />);
    expect(screen.getByText('t:common.noResults')).toBeInTheDocument();
    expect(state.standingsArg).toBeUndefined();
  });

  it('kalendar bez takmičenja koristi prvu sezonu i traži tabelu bez edicije', () => {
    state.seasons = [{ id: 's2', name: 'Sezona 2024/25' }];
    state.standings = [row];
    render(<LeagueTable />);
    expect(state.standingsArg).toBeUndefined();
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
  });
});
