import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembershipAdminPage } from './MembershipAdminPage';
import {
  membershipRow as row,
  membershipState as state,
  resetMembershipAdminState,
} from '../../test/doubles/membership-admin-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', async () =>
  (await import('../../test/doubles/membership-admin-doubles')).membershipAuthModule(),
);
vi.mock('../../hooks/use-confirm', async () =>
  (await import('../../test/doubles/membership-admin-doubles')).membershipConfirmModule(),
);
vi.mock('../../hooks/use-membership', async () =>
  (await import('../../test/doubles/membership-admin-doubles')).membershipHooksModule(),
);
vi.mock('../../components/seo/Seo', async () =>
  (await import('../../test/doubles/membership-admin-doubles')).membershipSeoModule(),
);
vi.mock('../../components/membership/MembershipCardsBulkExport', async () =>
  (await import('../../test/doubles/membership-admin-doubles')).membershipExportModule(),
);
vi.mock('./MembershipDetailSheet', async () =>
  (await import('../../test/doubles/membership-admin-doubles')).membershipDetailModule(),
);
vi.mock('./MembershipAdminFormSheet', async () =>
  (await import('../../test/doubles/membership-admin-doubles')).membershipFormModule(),
);
vi.mock('../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: doubles.AdminPageShellDouble, AdminDataTable: doubles.AdminDataTableDouble };
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <MembershipAdminPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  resetMembershipAdminState();
});

describe('MembershipAdminPage — akcije nad članstvom', () => {
  it('bez dozvole nema akcija ni dugmeta za novog člana', () => {
    state.perms = [];
    renderPage();
    expect(screen.queryByRole('button', { name: 'Novi član' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Detalj' })).toBeNull();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('sa dozvolom prikazuje akcije primjerene statusu ACTIVE', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Detalj' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Obnovi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suspenduj' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Otkaži' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aktiviraj' })).toBeNull();
  });

  it('status PENDING nudi Aktiviraj, ali ne Obnovi ni Suspenduj', () => {
    state.rows = [row({ status: 'PENDING' })];
    renderPage();
    expect(screen.getByRole('button', { name: 'Aktiviraj' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Obnovi' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Suspenduj' })).toBeNull();
  });

  it('aktivacija nakon potvrde poziva mutate sa id-em', async () => {
    const user = userEvent.setup();
    state.rows = [row({ status: 'PENDING' })];
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Aktiviraj' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith({
        title: 'Aktivirati članstvo?',
        confirmLabel: 'actions.confirm',
      }),
    );
    await waitFor(() => expect(state.mutate.activate).toHaveBeenCalledWith('m1'));
  });

  it('odbijena potvrda ne šalje zahtjev', async () => {
    const user = userEvent.setup();
    state.confirm.mockResolvedValue(false);
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Suspenduj' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.mutate.suspend).not.toHaveBeenCalled();
  });

  it('obnova, suspenzija i otkazivanje idu na svoje mutacije', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Obnovi' }));
    await waitFor(() => expect(state.mutate.renew).toHaveBeenCalledWith('m1'));
    await user.click(screen.getByRole('button', { name: 'Suspenduj' }));
    await waitFor(() => expect(state.mutate.suspend).toHaveBeenCalledWith('m1'));
    await user.click(screen.getByRole('button', { name: 'Otkaži' }));
    await waitFor(() => expect(state.mutate.cancel).toHaveBeenCalledWith('m1'));
  });

  it('pending stanje onemogućava dugmad akcija', () => {
    state.pending = { activate: true, renew: true, suspend: true, cancel: true };
    renderPage();
    ['Obnovi', 'Suspenduj', 'Otkaži'].forEach((name) =>
      expect(screen.getByRole('button', { name })).toBeDisabled(),
    );
  });

  it('klik na akciju ne otvara detalj reda', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(state.detail.open).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Obnovi' }));
    expect(state.detail.open).toBe(false);
  });
});

describe('MembershipAdminPage — detalj, kreiranje i linkovi', () => {
  it('klik na red i dugme Detalj otvaraju detalj', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('Ana Anić'));
    expect(state.detail).toEqual({ id: 'm1', open: true });
    await user.click(screen.getByRole('button', { name: 'Detalj' }));
    expect(state.detail.open).toBe(true);
  });

  it('zatvaranje sheeta detalja poništava odabir', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Detalj' }));
    expect(state.detail.open).toBe(true);
    await user.click(screen.getByRole('button', { name: 'zatvori-detalj' }));
    expect(state.detail).toEqual({ id: '', open: false });
  });

  it('dugme Novi član otvara formu za kreiranje', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(state.formSheet.open).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Novi član' }));
    expect(state.formSheet.open).toBe(true);
  });

  it('link Online postavke postoji samo uz dozvolu upravljanja', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Online postavke/ })).toHaveAttribute(
      'href',
      '/admin/ticketing',
    );
    cleanup();
    state.perms = [];
    renderPage();
    expect(screen.queryByRole('link', { name: /Online postavke/ })).toBeNull();
  });
});

describe('MembershipAdminPage — filter i ponovni pokušaj', () => {
  it('filter po statusu sužava tabelu', async () => {
    const user = userEvent.setup();
    state.rows = [
      row({ id: 'm1', status: 'ACTIVE' }),
      row({
        id: 'm2',
        status: 'PENDING',
        user: { id: 'u2', email: 'marko@example.com', firstName: 'Marko', lastName: 'Marković' },
      }),
    ];
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Na čekanju' }));
    expect(screen.getByTestId('row-m2')).toBeInTheDocument();
    expect(screen.queryByTestId('row-m1')).toBeNull();
  });

  it('ponovni pokušaj iz greške poziva refetch', async () => {
    const user = userEvent.setup();
    state.isError = true;
    renderPage();
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });
});
