import { render, screen } from '@testing-library/react';
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

describe('MembershipAdminPage — prikaz i stanja', () => {
  it('prikazuje naslov, kolone i red sa punim imenom', () => {
    renderPage();
    expect(screen.getByText('admin.membershipPage.title')).toBeInTheDocument();
    expect(screen.getByTestId('row-m1').querySelectorAll('[data-col]')).toHaveLength(6);
    expect(screen.getByText('Ana Anić')).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('K-001')).toBeInTheDocument();
  });

  it('prazna polja korisnika i kartice prikazuju crticu', () => {
    state.rows = [{ id: 'm2', status: 'PENDING', user: undefined, card: null, endDate: null }];
    renderPage();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
  });

  it('prazna lista prikazuje poruku bez članstava', () => {
    state.rows = [];
    renderPage();
    expect(screen.getByText('Nema članstava.')).toBeInTheDocument();
  });

  it('greška prikazuje retry koji poziva refetch', async () => {
    const user = userEvent.setup();
    state.isError = true;
    renderPage();
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });

  it('učitavanje prikazuje indikator umjesto tabele', () => {
    state.isLoading = true;
    renderPage();
    expect(screen.getByText('učitavanje')).toBeInTheDocument();
    expect(screen.queryByText('Ana Anić')).toBeNull();
  });
});

describe('MembershipAdminPage — filteri i statusi', () => {
  it('filter po statusu sužava redove i osvježava izvoz', async () => {
    const user = userEvent.setup();
    state.rows = [
      row(),
      row({ id: 'm2', status: 'EXPIRED', user: { id: 'u2', email: 'b@example.com', firstName: 'Bora' } }),
    ];
    renderPage();
    expect(screen.getByText('izvoz-kartica:2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Istekla' }));
    expect(screen.getByText('Bora')).toBeInTheDocument();
    expect(screen.queryByText('ana@example.com')).toBeNull();
    expect(screen.getByText('izvoz-kartica:1')).toBeInTheDocument();
  });

  it('filter bez rezultata prikazuje prazno stanje', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Otkazana' }));
    expect(screen.getByText('Nema članstava.')).toBeInTheDocument();
  });

  it('Otkazana oznaka se mijenja za CANCELLED', () => {
    state.rows = [row({ id: 'm3', status: 'CANCELLED', user: { id: 'u3', email: 'c@example.com' } })];
    renderPage();
    expect(screen.getByText('Otkazana')).toBeInTheDocument();
  });
});
