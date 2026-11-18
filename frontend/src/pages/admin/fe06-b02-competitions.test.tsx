import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompetitionsAdminPage } from './CompetitionsAdminPage';

const state = vi.hoisted(() => ({
  competitions: { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  seasons: { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  canManage: true,
  deleteComp: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  deleteSeason: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  confirm: vi.fn(async () => true),
  seo: [] as string[],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts?.defaultValue) {
        let s = opts.defaultValue as string;
        if (opts.time) s = s.replace('{{time}}', opts.time as string);
        return s;
      }
      return k;
    },
  }),
}));
vi.mock('../../hooks', () => ({ useCompetitions: () => state.competitions, useSeasons: () => state.seasons }));
vi.mock('../../hooks/use-competition-admin', () => ({ useDeleteCompetition: () => state.deleteComp }));
vi.mock('../../hooks/use-season-admin', () => ({ useDeleteSeason: () => state.deleteSeason }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.canManage ? ['competitions.manage'] : [] } }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title?: string }) => { state.seo.push(title ?? ''); return null; } }));
vi.mock('./CompetitionsAdminFormSheet', () => ({ CompetitionsAdminFormSheet: () => <div data-testid="sheet" /> }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminDataTable: d.AdminDataTableDouble, AdminPageShell: d.AdminPageShellDouble };
});
// badge, button, skeleton real
vi.mock('../../components/ui/badge', async () => {
  const a = await vi.importActual<typeof import('../../components/ui/badge')>('../../components/ui/badge');
  return a;
});

const competitions = [
  { id: 'c1', name: 'Premijer liga', slug: 'premijer-liga', isLeague: true },
  { id: 'c2', name: 'Kup', slug: 'kup', isLeague: false },
];
const seasons = [
  { id: 's1', name: '2025/26', yearStart: 2025, yearEnd: 2026, isActive: true, competitions: [{ id: 'e1' }] },
  { id: 's2', name: '2024/25', yearStart: 2024, yearEnd: 2025, isActive: false },
];

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}

describe('B02 CompetitionsAdminPage — P1/P2', () => {
  beforeEach(() => {
    state.competitions = { data: competitions as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.competitions;
    state.seasons = { data: seasons as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.seasons;
    state.canManage = true;
    state.deleteComp = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.deleteComp;
    state.deleteSeason = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.deleteSeason;
    state.confirm = vi.fn(async () => true);
    state.seo = [];
  });

  it('competitions error — role=alert, heading i Seo ostaju, retry poziva refetch', async () => {
    state.competitions = { data: competitions as unknown[], isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.competitions;
    render(wrap(<CompetitionsAdminPage />));
    const alert = screen.getAllByRole('alert')[0];
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.competitionsAdmin.title' })).toBeInTheDocument();
    expect(state.seo[0]).toBe('admin.competitionsAdmin.metaTitle');
    const retry = within(alert).getByRole('button');
    await userEvent.click(retry);
    expect(state.competitions.refetch).toHaveBeenCalled();
  });

  it('seasons error — role=alert, retry disabled kad isFetching', async () => {
    state.seasons = { data: seasons as unknown[], isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.seasons;
    render(wrap(<CompetitionsAdminPage />));
    const alert = screen.getByRole('alert');
    const btn = within(alert).getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.textContent).toMatch(/loading/i);
  });

  it('seasons loading — aria-busy skeleton, competitions tabela i dalje vidljiva', () => {
    state.seasons = { data: seasons as unknown[], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.seasons;
    render(wrap(<CompetitionsAdminPage />));
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.getByTestId('row-c1')).toBeInTheDocument(); // competitions table still
  });

  it('competitions loading — aria-busy', () => {
    state.competitions = { data: competitions as unknown[], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.competitions;
    render(wrap(<CompetitionsAdminPage />));
    expect(document.querySelectorAll('[aria-busy="true"]').length).toBeGreaterThanOrEqual(1);
  });

  it('empty ima role=status po sekciji', () => {
    state.seasons = { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.seasons;
    state.competitions = { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.competitions;
    render(wrap(<CompetitionsAdminPage />));
    const statuses = screen.getAllByRole('status');
    expect(statuses.length).toBeGreaterThanOrEqual(2);
    expect(statuses.some((el) => el.textContent?.includes('emptySeasons'))).toBe(true);
  });

  it('lastUpdated i Osvježi poziva oba refetch-a, disabled kad fetching', async () => {
    const ts = Date.now();
    state.seasons = { data: seasons as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() } as unknown as typeof state.seasons;
    state.competitions = { data: competitions as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts - 1000, refetch: vi.fn() } as unknown as typeof state.competitions;
    render(wrap(<CompetitionsAdminPage />));
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Osvježi/ }));
    expect(state.seasons.refetch).toHaveBeenCalled();
    expect(state.competitions.refetch).toHaveBeenCalled();
  });

  it('lastUpdated Osvježi disabled kad bilo koji fetching', () => {
    const ts = Date.now();
    state.seasons = { data: seasons as unknown[], isLoading: false, isError: false, isFetching: true, dataUpdatedAt: ts, refetch: vi.fn() } as unknown as typeof state.seasons;
    state.competitions = { data: competitions as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() } as unknown as typeof state.competitions;
    render(wrap(<CompetitionsAdminPage />));
    const btn = screen.getByRole('button', { name: /loading/i });
    expect(btn).toBeDisabled();
  });

  it('delete buttons disabled per type — seasons pending ne disable katalog', () => {
    state.deleteSeason = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.deleteSeason;
    state.deleteComp = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.deleteComp;
    render(wrap(<CompetitionsAdminPage />));
    // season edit/delete disabled
    const seasonRow = screen.getByTestId('row-s1');
    const seasonBtns = within(seasonRow).getAllByRole('button');
    expect(seasonBtns.every((b) => b.hasAttribute('disabled'))).toBe(true);
    // competition row not disabled
    const compRow = screen.getByTestId('row-c1');
    const compBtns = within(compRow).getAllByRole('button');
    expect(compBtns.every((b) => !b.hasAttribute('disabled'))).toBe(true);
  });

  it('delete competition pending disable katalog buttons', () => {
    state.deleteComp = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.deleteComp;
    render(wrap(<CompetitionsAdminPage />));
    const compRow = screen.getByTestId('row-c1');
    const compBtns = within(compRow).getAllByRole('button');
    expect(compBtns[0]).toBeDisabled();
    expect(compBtns[1]).toBeDisabled();
  });

  it('add buttons disabled per type', () => {
    state.deleteSeason = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.deleteSeason;
    render(wrap(<CompetitionsAdminPage />));
    // season add should be disabled, catalog add not
    const addBtns = screen.getAllByRole('button').filter((b) => b.textContent?.includes('catalogShort') || b.textContent?.includes('seasonShort'));
    const seasonAdd = addBtns.find((b) => b.textContent?.includes('seasonShort'));
    const catalogAdd = addBtns.find((b) => b.textContent?.includes('catalogShort'));
    expect(seasonAdd).toBeDisabled();
    expect(catalogAdd).not.toBeDisabled();
  });
});
