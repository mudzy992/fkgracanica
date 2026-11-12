import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeagueTableWidget } from './LeagueTableWidget';

const state = vi.hoisted(() => ({
  club: { data: { id: 'c1' } as unknown },
  seasons: { data: undefined as unknown, isLoading: false },
  standings: { data: undefined as unknown, isLoading: false },
  standingsEdition: undefined as string | undefined,
  pickedCalendarId: 'cal1' as string | undefined,
  leagueEdition: undefined as unknown,
  table: {} as Record<string, unknown>,
  mobile: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));
vi.mock('../../hooks', () => ({
  useOwnClub: () => state.club,
  useSeasons: () => state.seasons,
  useStandings: (editionId?: string) => {
    state.standingsEdition = editionId;
    return state.standings;
  },
}));
vi.mock('../../lib/season-utils', () => ({
  pickDefaultCalendarId: () => state.pickedCalendarId,
  leagueEdition: () => state.leagueEdition,
  sortedEditions: (calendar: { editions?: unknown[] } | undefined) =>
    (calendar?.editions ?? []) as unknown[],
  editionLabel: (edition: { label: string }) => edition.label,
}));
vi.mock('../../components/public/league/LeagueStandingsMobile', () => ({
  LeagueStandingsMobile: (props: Record<string, unknown>) => {
    state.mobile = props;
    return <div>mobilna:{(props.rows as unknown[]).length}</div>;
  },
}));
vi.mock('../../components/public/league/LeagueStandingsTable', () => ({
  LeagueStandingsTable: (props: Record<string, unknown>) => {
    state.table = props;
    return <div>tabela:{(props.rows as unknown[]).length}</div>;
  },
}));
vi.mock('../../components/public/shell/WidgetSectionShell', () => ({
  WidgetSectionShell: ({ id, children }: { id: string; children: React.ReactNode }) => (
    <section data-id={id}>{children}</section>
  ),
}));
vi.mock('../../components/public/shell/WidgetSectionHeaderBlock', () => ({
  WidgetSectionHeaderBlock: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <header>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </header>
  ),
}));
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

const edition = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  label: `Sezona ${id}`,
  ...over,
});
const calendar = (editions: unknown[]) => ({ id: 'cal1', editions });

const renderWidget = (config: Record<string, unknown> = {}) =>
  render(<LeagueTableWidget config={config as never} />);

beforeEach(() => {
  state.club = { data: { id: 'c1' } };
  state.seasons = { data: [calendar([edition('e1', { competition: { isLeague: true } })])], isLoading: false };
  state.standings = { data: [{ clubId: 'c1', position: 1 }], isLoading: false };
  state.standingsEdition = undefined;
  state.pickedCalendarId = 'cal1';
  state.leagueEdition = { id: 'e1' };
  state.table = {};
  state.mobile = {};
});

describe('LeagueTableWidget — osnovni prikaz', () => {
  it('prikazuje naslov izabrane edicije i podnaslov iz prijevoda', () => {
    renderWidget();
    expect(screen.getByRole('heading', { name: 'Sezona e1' })).toBeInTheDocument();
    expect(screen.getByText('Trenutno stanje u ligi')).toBeInTheDocument();
    expect(screen.getByText('mobilna:1')).toBeInTheDocument();
    expect(screen.getByText('tabela:1')).toBeInTheDocument();
    expect(state.table.highlightClubId).toBe('c1');
    expect(state.standingsEdition).toBe('e1');
  });

  it('naslov pada na config.title kad nema edicije', () => {
    state.seasons = { data: [], isLoading: false };
    state.leagueEdition = undefined;
    renderWidget({ title: 'Tabela lige' });
    expect(screen.getByRole('heading', { name: 'Tabela lige' })).toBeInTheDocument();
  });

  it('bez config naslova koristi prijevod', () => {
    state.seasons = { data: [], isLoading: false };
    state.leagueEdition = undefined;
    renderWidget();
    expect(screen.getByRole('heading', { name: 'home.leagueTable' })).toBeInTheDocument();
  });

  it('bez redova prikazuje poruku bez rezultata', () => {
    state.standings = { data: [], isLoading: false };
    renderWidget();
    expect(screen.getByText('common.noResults')).toBeInTheDocument();
  });

  it('dok se podaci učitavaju prikazuje skeleton bez tabela', () => {
    state.seasons = { data: [], isLoading: true };
    renderWidget();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByText(/tabela:/)).toBeNull();
    expect(screen.queryByText('common.noResults')).toBeNull();
  });

  it('učitavanje tabele takođe drži skeleton', () => {
    state.standings = { data: undefined, isLoading: true };
    renderWidget();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
});

describe('LeagueTableWidget — izbor edicije', () => {
  it('sa više edicija prikazuje dugmad i oznaku lige', async () => {
    const user = userEvent.setup();
    state.seasons = {
      data: [
        calendar([
          edition('e1', { competition: { isLeague: true } }),
          edition('e2', { competition: { isLeague: false } }),
        ]),
      ],
      isLoading: false,
    };
    renderWidget();
    const pills = screen.getAllByRole('button');
    expect(pills.map((p) => p.textContent)).toEqual(['Sezona e1 · liga', 'Sezona e2']);
    await user.click(screen.getByRole('button', { name: 'Sezona e2' }));
    expect(state.standingsEdition).toBe('e2');
    expect(screen.getByRole('heading', { name: 'Sezona e2' })).toBeInTheDocument();
  });

  it('sa jednom edicijom nema dugmadi za izbor', () => {
    renderWidget();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('zadržava izbor kad edicija i dalje postoji', () => {
    state.seasons = {
      data: [calendar([edition('e1'), edition('e2')])],
      isLoading: false,
    };
    const { rerender } = renderWidget();
    expect(state.standingsEdition).toBe('e1');
    rerender(<LeagueTableWidget config={{} as never} />);
    expect(state.standingsEdition).toBe('e1');
  });

  it('bez kluba nema oznake kluba u tabeli', () => {
    state.club = { data: undefined };
    renderWidget();
    expect(state.table.highlightClubId).toBeUndefined();
  });

  it('bez sezona koristi praznu listu bez pada', () => {
    state.seasons = { data: undefined, isLoading: false };
    renderWidget();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByTestId('skeleton')).toBeNull();
  });
  it('novi podaci sezona zadržavaju postojeći izbor', () => {
    state.seasons = { data: [calendar([edition('e1'), edition('e2')])], isLoading: false };
    const { rerender } = renderWidget();
    expect(state.standingsEdition).toBe('e1');
    state.seasons = { data: [calendar([edition('e1'), edition('e2'), edition('e3')])], isLoading: false };
    rerender(<LeagueTableWidget config={{} as never} />);
    expect(state.standingsEdition).toBe('e1');
  });

  it('izbor pada na ligu kad odabrana edicija nestane', () => {
    state.seasons = { data: [calendar([edition('e1'), edition('e2')])], isLoading: false };
    const { rerender } = renderWidget();
    expect(state.standingsEdition).toBe('e1');
    state.leagueEdition = { id: 'e2' };
    state.seasons = { data: [calendar([edition('e2')])], isLoading: false };
    rerender(<LeagueTableWidget config={{} as never} />);
    expect(state.standingsEdition).toBe('e2');
  });
});
