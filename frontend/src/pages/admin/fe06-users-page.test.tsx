import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersPage } from './UsersPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';
import {
  resetUsersPageState,
  usersPageRow as userRow,
  usersPageState as state,
} from '../../test/doubles/users-page-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', async () => (await import('../../test/doubles/users-page-doubles')).usersAuthModule());
vi.mock('../../hooks', async () => (await import('../../test/doubles/users-page-doubles')).usersHooksModule());
vi.mock('../../hooks/use-users-admin', async () =>
  (await import('../../test/doubles/users-page-doubles')).usersDeleteModule(),
);
vi.mock('../../hooks/use-confirm', async () =>
  (await import('../../test/doubles/users-page-doubles')).usersConfirmModule(),
);
vi.mock('../../components/seo/Seo', async () =>
  (await import('../../test/doubles/users-page-doubles')).usersSeoModule(),
);
vi.mock('../../components/ui/skeleton', async () =>
  (await import('../../test/doubles/users-page-doubles')).usersSkeletonModule(),
);
vi.mock('./UserAdminFormSheet', async () =>
  (await import('../../test/doubles/users-page-doubles')).usersFormSheetModule(),
);
vi.mock('../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: doubles.AdminPageShellDouble, AdminDataTable: doubles.AdminDataTableDouble };
});

const renderPage = (embedded = false) =>
  render(
    <MemoryRouter>
      <UsersPage embedded={embedded} />
    </MemoryRouter>,
  );

beforeEach(() => {
  resetUsersPageState();
  adminShellState.actions = null;
});

describe('UsersPage — prikaz', () => {
  it('prikazuje email, ime, uloge i status aktivnog korisnika', () => {
    renderPage();
    expect(screen.getByText('seo:admin.users')).toBeInTheDocument();
    expect(screen.getByText('marko@fk.ba')).toBeInTheDocument();
    expect(screen.getByText('Marko Marić')).toBeInTheDocument();
    expect(screen.getByText('Admin, Trener')).toBeInTheDocument();
    expect(screen.getByText('Aktivan')).toBeInTheDocument();
  });

  it('neaktivan korisnik bez imena i uloga dobija crtice i oznaku Neaktivan', () => {
    state.rows = [userRow({ firstName: null, lastName: null, isActive: false, roles: [] })];
    renderPage();
    expect(screen.getByText('Neaktivan')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('prazna lista prikazuje poruku bez korisnika', () => {
    state.rows = [];
    renderPage();
    expect(screen.getByText('Nema korisnika.')).toBeInTheDocument();
  });

  it('učitavanje u ljusci prikazuje indikator umjesto tabele', () => {
    state.isLoading = true;
    renderPage();
    expect(screen.getByText('učitavanje')).toBeInTheDocument();
    expect(screen.queryByText('marko@fk.ba')).toBeNull();
  });

  it('učitavanje u ugrađenom režimu prikazuje pet skeleton redova', () => {
    state.isLoading = true;
    renderPage(true);
    expect(screen.getAllByText('skeleton')).toHaveLength(5);
  });

  it('greška prikazuje retry koji poziva refetch', async () => {
    const user = userEvent.setup();
    state.isError = true;
    renderPage();
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });
});

describe('UsersPage — pretraga i paginacija', () => {
  it('pretraga prosljeđuje upit i vraća se na prvu stranicu', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Sljedeća' }));
    await waitFor(() => expect(state.calls.at(-1)).toMatchObject({ page: 2 }));
    await user.type(screen.getByPlaceholderText('admin.usersAdmin.search'), 'ana');
    await waitFor(() => expect(state.calls.at(-1)).toEqual({ page: 1, search: 'ana' }));
  });

  it('prazna pretraga šalje undefined umjesto praznog stringa', async () => {
    const user = userEvent.setup();
    renderPage();
    const input = screen.getByPlaceholderText('admin.usersAdmin.search');
    await user.type(input, 'a');
    await waitFor(() => expect(state.calls.at(-1)).toEqual({ page: 1, search: 'a' }));
    await user.clear(input);
    await waitFor(() => expect(state.calls.at(-1)).toEqual({ page: 1, search: undefined }));
  });

  it('paginacija skriva se kad ima samo jedna stranica', () => {
    state.meta = { total: 1, page: 1, limit: 20, totalPages: 1 };
    renderPage();
    expect(screen.queryByRole('button', { name: 'Sljedeća' })).toBeNull();
  });

  it('bez meta objekta nema paginacije', () => {
    state.meta = undefined;
    renderPage();
    expect(screen.queryByRole('button', { name: 'Prethodna' })).toBeNull();
  });
});
