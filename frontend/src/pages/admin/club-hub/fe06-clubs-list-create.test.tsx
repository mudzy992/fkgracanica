import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubsListPage } from './ClubsListPage';

vi.mock('../../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isLoading, isError, onRetry, actions, children }: {
    title: string; isLoading?: boolean; isError?: boolean;
    onRetry?: () => void; actions?: ReactNode; children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div data-testid="actions">{actions}</div>
      {isError && (
        <div>
          <p>greška-učitavanja</p>
          <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>
        </div>
      )}
      {isLoading ? <p>učitavanje</p> : children}
    </div>
  ),
  AdminDataTable: ({ rows, columns }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    columns: Array<{ key: string; render: (row: never) => ReactNode }>;
  }) => (
    <div>
      {rows.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {columns.map((column) => (
            <span key={column.key} data-col={column.key}>{column.render(row as never)}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const state = vi.hoisted(() => ({
  clubs: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  remove: { mutateAsync: vi.fn(async () => ({})) },
  create: { mutateAsync: vi.fn(async () => ({ id: 'c-new' })), isPending: false },
  navigate: vi.fn(),
  confirm: vi.fn(async () => true),
  permissions: ['clubs.manage', 'gallery.manage'] as string[],
  seo: [] as (string | undefined)[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../../hooks/use-club-hub', () => ({ useClubsWithCounts: () => state.clubs }));
vi.mock('../../../hooks/use-competition-admin', () => ({
  useDeleteClub: () => state.remove,
  useCreateClub: () => state.create,
}));
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('../../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, children }: { open: boolean; title: string; children: React.ReactNode }) =>
    open ? <section aria-label={title}>{children}</section> : null,
}));
vi.mock('../../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <button aria-label={label} onClick={() => onChange('media/crest.png')}>
      vrijednost:{value}
    </button>
  ),
}));

const renderPage = (ui: ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

const club = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  name: `Klub ${id}`,
  city: 'Gračanica',
  isOwnClub: false,
  _count: { players: 12 },
  ...over,
});

const rows = () => screen.queryAllByTestId(/^row-/);

describe('ClubsListPage', () => {
  beforeEach(() => {
    state.permissions = ['clubs.manage', 'gallery.manage'];
    state.clubs = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
    state.remove = { mutateAsync: vi.fn(async () => ({})) };
    state.confirm = vi.fn(async () => true);
    state.navigate = vi.fn();
    state.seo = [];
  });

  it('postavlja naslov, SEO i akciju za novi klub', () => {
    renderPage(<ClubsListPage />);
    expect(state.seo).toContain('admin.clubSquad');
    expect(screen.getByRole('heading', { name: 'admin.clubSquad' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Novi klub/ })).toBeTruthy();
  });

  it('bez clubs.manage nema dugmeta za novi klub', () => {
    state.permissions = [];
    renderPage(<ClubsListPage />);
    expect(screen.queryByRole('button', { name: /Novi klub/ })).toBeNull();
  });

  it('prikazuje redove sa gradom, brojem igrača i tipom kluba', () => {
    state.clubs = {
      data: [club('c1'), club('c2', { city: null, isOwnClub: true, _count: undefined })],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage(<ClubsListPage />);
    expect(rows()).toHaveLength(2);
    const first = screen.getByTestId('row-c1');
    expect(within(first).getByRole('link', { name: 'Klub c1' }).getAttribute('href')).toBe('/admin/clubs/c1');
    expect(within(first).getByText('Gračanica')).toBeTruthy();
    expect(within(first).getByText('12')).toBeTruthy();
    expect(within(first).getByText('admin.clubsList.opponent')).toBeTruthy();

    const second = screen.getByTestId('row-c2');
    expect(within(second).getByText('—')).toBeTruthy();
    expect(within(second).getByText('0')).toBeTruthy();
    expect(within(second).getByText('admin.club.ownClub')).toBeTruthy();
  });

  it('stanje učitavanja i greške se prosljeđuju ljusci', () => {
    state.clubs = { data: undefined, isLoading: true, isError: true, refetch: vi.fn() };
    renderPage(<ClubsListPage />);
    expect(screen.getByText('učitavanje')).toBeTruthy();
    expect(screen.getByText('greška-učitavanja')).toBeTruthy();
    return userEvent.click(screen.getByRole('button', { name: 'pokušaj-ponovo' })).then(() => {
      expect(state.clubs.refetch).toHaveBeenCalled();
    });
  });

  it('brisanje traži potvrdu i šalje ID kluba', async () => {
    state.clubs = { data: [club('c1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage(<ClubsListPage />);
    await userEvent.click(screen.getByRole('button', { name: 'actions.delete' }));
    expect(state.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Obrisati klub?', description: '"Klub c1" će biti obrisan.' }),
    );
    expect(state.remove.mutateAsync).toHaveBeenCalledWith('c1');
  });

  it('odbijena potvrda ne briše klub', async () => {
    state.confirm = vi.fn(async () => false);
    state.clubs = { data: [club('c1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage(<ClubsListPage />);
    await userEvent.click(screen.getByRole('button', { name: 'actions.delete' }));
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });

  it('vlastiti klub nema dugme za brisanje', () => {
    state.clubs = {
      data: [club('c1', { isOwnClub: true })],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage(<ClubsListPage />);
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
    expect(screen.getByRole('link', { name: 'admin.clubsList.manage' }).getAttribute('href')).toBe(
      '/admin/clubs/c1',
    );
  });

  it('bez clubs.manage nema brisanja ni uređivanja', () => {
    state.permissions = [];
    state.clubs = { data: [club('c1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage(<ClubsListPage />);
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
    expect(screen.getByRole('link', { name: 'admin.clubsList.manage' })).toBeTruthy();
  });

  it('kreiranje kluba vodi na hub novog kluba', async () => {
    const user = userEvent.setup();
    const Ruta = () => <p>{`ruta:${useLocation().pathname}${useLocation().search}`}</p>;
    render(
      <MemoryRouter initialEntries={['/admin/clubs']}><ClubsListPage /><Ruta /></MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /Novi klub/ }));
    await user.type(screen.getByPlaceholderText('admin.clubForm.name'), 'FK Novi');
    await user.click(screen.getByRole('button', { name: /Kreiraj i otvori hub/ }));
    await waitFor(() => expect(screen.getByText('ruta:/admin/clubs/c-new?tab=basic')).toBeTruthy());
  });
});
