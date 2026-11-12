import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubCompetitionTabs } from './ClubCompetitionTabs';

const state = vi.hoisted(() => ({
  standings: { data: [] as unknown, isLoading: false },
  seasonArgs: [] as (string | undefined)[],
  rounds: [] as Record<string, unknown>[],
  mobile: [] as Record<string, unknown>[],
  table: [] as Record<string, unknown>[],
}));

vi.mock('../../ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />,
}));
vi.mock('../../../hooks/use-competition-admin', () => ({
  useStandings: (seasonId?: string) => {
    state.seasonArgs.push(seasonId);
    return state.standings;
  },
}));
vi.mock('../PublicPill', () => ({
  PublicPill: ({ active, onClick, children }: {
    active: boolean; onClick: () => void; children: React.ReactNode;
  }) => (
    <button data-active={active} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock('../../news/NewsSectionTitle', () => ({
  NewsSectionTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));
vi.mock('../league/LeagueStandingsMobile', () => ({
  LeagueStandingsMobile: (props: Record<string, unknown>) => {
    state.mobile.push(props);
    return <div data-testid="standings-mobile" />;
  },
}));
vi.mock('../league/LeagueStandingsTable', () => ({
  LeagueStandingsTable: (props: Record<string, unknown>) => {
    state.table.push(props);
    return <div data-testid="standings-table" />;
  },
}));
vi.mock('./ClubRoundMatches', () => ({
  ClubRoundMatches: (props: Record<string, unknown>) => {
    state.rounds.push(props);
    return <div data-testid="club-rounds" />;
  },
}));

const participation = (over: Record<string, unknown> = {}) => ({
  seasonId: 's1',
  seasonName: '2025/26',
  competitionName: 'Premijer liga',
  isActive: true,
  isLeague: true,
  yearStart: 2025,
  ...over,
});

const renderTabs = (participations = [participation()]) =>
  render(<ClubCompetitionTabs clubId="c1" participations={participations as never} />);

describe('ClubCompetitionTabs', () => {
  beforeEach(() => {
    state.standings = { data: [{ clubId: 'c1' }], isLoading: false };
    state.seasonArgs = [];
    state.rounds = [];
    state.mobile = [];
    state.table = [];
  });

  it('bez participacija ne renderuje ništa', () => {
    const { container } = renderTabs([]);
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje naslov i podrazumijevano tab Kola', () => {
    renderTabs();
    expect(screen.getByRole('heading', { name: 'Takmičenja' })).toBeTruthy();
    expect(screen.getByTestId('club-rounds')).toBeTruthy();
    expect(state.rounds[0]).toEqual({ clubId: 'c1', seasonId: 's1' });
  });

  it('sa jednom participacijom nema reda birača sezone', () => {
    renderTabs();
    expect(screen.queryByText('Premijer liga (2025/26)')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Premijer liga (2025/26)' })).toBeNull();
  });

  it('više participacija prikazuje birače i mijenja sezonu', async () => {
    renderTabs([
      participation(),
      participation({ seasonId: 's0', seasonName: '2024/25', yearStart: 2024 }),
    ]);
    const pills = screen.getAllByRole('button', { name: /Premijer liga/ });
    expect(pills).toHaveLength(2);
    await userEvent.click(pills[1]);
    expect(state.rounds.at(-1)).toEqual({ clubId: 'c1', seasonId: 's0' });
  });

  it('tab Tabela prikazuje skeleton dok se tabele učitavaju', async () => {
    state.standings = { data: undefined, isLoading: true };
    renderTabs();
    await userEvent.click(screen.getByRole('button', { name: 'Tabela' }));
    expect(screen.getByTestId('skeleton')).toBeTruthy();
    expect(screen.queryByTestId('standings-table')).toBeNull();
  });

  it('tab Tabela prikazuje mobilnu i desktop tabelu sa označenim klubom', async () => {
    renderTabs();
    await userEvent.click(screen.getByRole('button', { name: 'Tabela' }));
    expect(screen.getByTestId('standings-mobile')).toBeTruthy();
    expect(screen.getByTestId('standings-table')).toBeTruthy();
    expect(state.mobile[0]).toEqual({ rows: [{ clubId: 'c1' }], highlightClubId: 'c1' });
    expect(state.table[0]).toEqual({ rows: [{ clubId: 'c1' }], highlightClubId: 'c1' });
  });

  it('bez podataka tabela dobija praznu listu', async () => {
    state.standings = { data: undefined, isLoading: false };
    renderTabs();
    await userEvent.click(screen.getByRole('button', { name: 'Tabela' }));
    expect(state.mobile[0]).toEqual({ rows: [], highlightClubId: 'c1' });
  });

  it('povratak na tab Kola ponovo prikazuje utakmice', async () => {
    renderTabs();
    await userEvent.click(screen.getByRole('button', { name: 'Tabela' }));
    await userEvent.click(screen.getByRole('button', { name: 'Kola' }));
    expect(screen.getByTestId('club-rounds')).toBeTruthy();
    expect(screen.queryByTestId('standings-mobile')).toBeNull();
  });

  it('aktivni pill ima data-active za tekuću sezonu', () => {
    renderTabs([
      participation(),
      participation({ seasonId: 's0', seasonName: '2024/25', yearStart: 2024 }),
    ]);
    const pills = screen.getAllByRole('button', { name: /Premijer liga/ });
    expect(pills[0].getAttribute('data-active')).toBe('true');
    expect(pills[1].getAttribute('data-active')).toBe('false');
  });
});

describe('ClubCompetitionTabs — osvježeni podaci', () => {
  it('zadržava odabranu sezonu kad se lista participacija osvježi', async () => {
    const { rerender } = renderTabs([participation(), participation({ seasonId: 's2', seasonName: '2024/25', isActive: false })]);
    await waitFor(() => expect(state.seasonArgs.at(-1)).toBe('s1'));
    rerender(<ClubCompetitionTabs clubId="c1" participations={[participation(), participation({ seasonId: 's2', seasonName: '2024/25', isActive: false })] as never} />);
    await waitFor(() => expect(state.seasonArgs.at(-1)).toBe('s1'));
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });
});
