import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersPage } from './UsersPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';
import { resetUsersPageState, usersPageState as state } from '../../test/doubles/users-page-doubles';

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

describe('UsersPage — dozvole, forma i brisanje', () => {
  it('bez dozvola nema akcija ni kreiranja', () => {
    state.perms = [];
    renderPage();
    expect(screen.queryByRole('button', { name: 'Novi' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
    expect(adminShellState.actions).toBeNull();
  });

  it('Novi otvara formu bez korisnika, a olovka sa izabranim redom', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Novi' }));
    expect(state.sheet).toEqual({ open: true, user: null });
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect(state.sheet.open).toBe(true);
    expect(state.sheet.user?.id).toBe('u1');
  });

  it('brisanje traži potvrdu sa emailom pa briše tek nakon odobrenja', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith({
        title: 'Obrisati korisnika?',
        description: 'marko@fk.ba',
        variant: 'danger',
        confirmLabel: 'Obriši',
      }),
    );
    await waitFor(() => expect(state.deleteUser).toHaveBeenCalledWith('u1'));
  });

  it('odbijena potvrda ne briše korisnika', async () => {
    const user = userEvent.setup();
    state.confirm.mockResolvedValue(false);
    renderPage();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.deleteUser).not.toHaveBeenCalled();
  });

  it('embedded prikazuje kreiraj iznad pretrage i nema SEO naslov', () => {
    renderPage(true);
    expect(screen.queryByText(/^seo:/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Novi' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin.usersAdmin.search')).toBeInTheDocument();
  });
});
