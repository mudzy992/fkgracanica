import type { ReactNode } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { CompetitionsAdminPage } from './CompetitionsAdminPage';

type Row = Record<string, unknown> & { id: string };
type Column = { key: string; header: string; render: (row: Row) => ReactNode };

const state = vi.hoisted(() => ({
  competitions: { data: [] as unknown[], isLoading: false },
  seasons: { data: [] as unknown[], isLoading: false },
  canManage: true,
  confirm: vi.fn(async () => true),
  deleteComp: { mutateAsync: vi.fn(async () => ({})) },
  deleteSeason: { mutateAsync: vi.fn(async () => ({})) },
  sheet: null as null | { open: boolean; mode: unknown; editCompetition: unknown; editSeason: unknown },
}));

vi.mock('../../hooks', () => ({
  useCompetitions: () => state.competitions,
  useSeasons: () => state.seasons,
}));
vi.mock('../../hooks/use-competition-admin', () => ({ useDeleteCompetition: () => state.deleteComp }));
vi.mock('../../hooks/use-season-admin', () => ({ useDeleteSeason: () => state.deleteSeason }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.canManage ? ['competitions.manage'] : [] } }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('./CompetitionsAdminFormSheet', () => ({
  CompetitionsAdminFormSheet: (props: { open: boolean; mode: unknown; editCompetition: unknown; editSeason: unknown }) => {
    state.sheet = props;
    return props.open
      ? <div data-testid="sheet">mode:{String(props.mode)} comp:{String((props.editCompetition as Row | null)?.id ?? '-')} season:{String((props.editSeason as Row | null)?.id ?? '-')}</div>
      : null;
  },
}));
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isLoading, actions, children }: { title: string; isLoading?: boolean; actions?: ReactNode; children: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {actions}
      {isLoading ? <p>učitavanje</p> : children}
    </div>
  ),
  AdminDataTable: ({ rows, columns, empty }: { rows: Row[]; columns: Column[]; empty?: string }) =>
    rows.length === 0 ? <p>{empty}</p> : (
      <div data-testid="table">
        {rows.map((row) => (
          <div key={row.id} data-testid={`row-${String(row.name)}`}>
            {columns.map((column) => <span key={column.key} data-col={column.key}>{column.render(row)}</span>)}
          </div>
        ))}
      </div>
    ),
}));

const seasons = [
  { id: 's1', name: '2025/26', yearStart: 2025, yearEnd: 2026, isActive: true, competitions: [{ id: 'e1' }, { id: 'e2' }] },
  { id: 's2', name: '2024/25', yearStart: 2024, yearEnd: 2025, isActive: false },
];
const competitions = [
  { id: 'c1', name: 'Premijer liga', slug: 'premijer-liga', isLeague: true },
  { id: 'c2', name: 'Kup', slug: 'kup', isLeague: false },
];

const renderPage = () => render(<MemoryRouter><CompetitionsAdminPage /></MemoryRouter>);

beforeEach(() => {
  state.competitions = { data: competitions, isLoading: false };
  state.seasons = { data: seasons, isLoading: false };
  state.canManage = true;
  state.confirm = vi.fn(async () => true);
  state.deleteComp = { mutateAsync: vi.fn(async () => ({})) };
  state.deleteSeason = { mutateAsync: vi.fn(async () => ({})) };
  state.sheet = null;
});

describe('CompetitionsAdminPage', () => {
  it('prikazuje sezone sa periodom, brojem takmičenja i statusom', () => {
    renderPage();
    const first = screen.getByTestId('row-2025/26');
    expect(within(first).getByText('2025–2026')).toBeInTheDocument();
    expect(within(first).getByText('2')).toBeInTheDocument();
    expect(within(screen.getByTestId('row-2024/25')).getByText('—')).toBeInTheDocument();
    expect(within(first).getByRole('link')).toHaveAttribute('href', '/admin/seasons/s1');
  });

  it('prikazuje katalog sa slugom i oznakama lige', () => {
    renderPage();
    const league = screen.getByTestId('row-Premijer liga');
    expect(within(league).getByText('premijer-liga')).toBeInTheDocument();
    expect(within(league).getAllByText(/Liga|liga/i).length).toBeGreaterThan(0);
    expect(within(screen.getByTestId('row-Kup')).getByText('kup')).toBeInTheDocument();
  });

  it('bez dozvole nema dugmadi za dodavanje ni akcija u redovima', () => {
    state.canManage = false;
    renderPage();
    expect(screen.queryByRole('button', { name: /catalogShort|seasonShort|Novi/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Uredi|edit/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Obriši|delete/i })).toBeNull();
  });

  it('dugmad otvaraju obrazac sa tačnim režimom i zapisom', async () => {
    const user = userEvent.setup();
    renderPage();
    const [catalogBtn] = screen.getAllByRole('button');
    await user.click(catalogBtn);
    expect(screen.getByTestId('sheet')).toHaveTextContent('mode:competition comp:- season:-');
    await user.click(screen.getByTestId('row-2025/26').querySelector('[aria-label]')!);
    expect(screen.getByTestId('sheet')).toHaveTextContent('mode:season comp:- season:s1');
    const compRow = screen.getByTestId('row-Premijer liga');
    await user.click(within(compRow).getByRole('button', { name: /Uredi|edit/i }));
    expect(screen.getByTestId('sheet')).toHaveTextContent('mode:competition comp:c1');
  });

  it('brisanje sezone i takmičenja ide kroz potvrdu', async () => {
    const user = userEvent.setup();
    renderPage();
    const seasonRow = screen.getByTestId('row-2025/26');
    await user.click(within(seasonRow).getByRole('button', { name: /Obriši|delete/i }));
    await waitFor(() => expect(state.deleteSeason.mutateAsync).toHaveBeenCalledWith('s1'));
    expect(state.confirm).toHaveBeenCalledWith(expect.objectContaining({ description: '2025/26', variant: 'danger' }));
    const compRow = screen.getByTestId('row-Premijer liga');
    await user.click(within(compRow).getByRole('button', { name: /Obriši|delete/i }));
    await waitFor(() => expect(state.deleteComp.mutateAsync).toHaveBeenCalledWith('c1'));
  });

  it('odbijena potvrda ne briše ni sezonu ni takmičenje', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    renderPage();
    await user.click(within(screen.getByTestId('row-2024/25')).getByRole('button', { name: /Obriši|delete/i }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.deleteSeason.mutateAsync).not.toHaveBeenCalled();
    expect(state.deleteComp.mutateAsync).not.toHaveBeenCalled();
  });

  it('dok se podaci učitavaju ne prikazuju se tabele; prazne liste daju poruke', () => {
    state.seasons = { data: seasons, isLoading: true };
    const { unmount } = renderPage();
    expect(screen.getByText('učitavanje')).toBeInTheDocument();
    expect(screen.queryByTestId('table')).toBeNull();
    unmount();
    state.seasons = { data: [], isLoading: false };
    state.competitions = { data: [], isLoading: false };
    renderPage();
    expect(screen.getAllByText(/emptySeasons|emptyCompetitions|Nema/i)).toHaveLength(2);
  });
});
