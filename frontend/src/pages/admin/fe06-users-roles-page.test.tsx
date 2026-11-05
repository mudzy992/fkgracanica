import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRolesPage } from './UsersRolesPage';
import { resetTabPageState, tabPageState as state } from '../../test/doubles/tab-page-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', async () =>
  (await import('../../test/doubles/tab-page-doubles')).tabAuthModule(),
);
vi.mock('../../components/seo/Seo', async () =>
  (await import('../../test/doubles/tab-page-doubles')).tabSeoModule(),
);
vi.mock('../../components/admin/AdminPageShell', async () =>
  (await import('../../test/doubles/tab-page-doubles')).tabShellModule(),
);
vi.mock('./UsersPage', async () => ({
  UsersPage: (await import('../../test/doubles/tab-page-doubles')).panelDouble('users'),
}));
vi.mock('./RolesPage', async () => ({
  RolesPage: (await import('../../test/doubles/tab-page-doubles')).panelDouble('roles'),
}));

function Probe() {
  const location = useLocation();
  return <div data-testid="loc">{`${location.pathname}${location.search}`}</div>;
}

const renderAt = (path = '/admin/korisnici') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
      <Routes>
        <Route path="/admin/korisnici" element={<UsersRolesPage />} />
        <Route path="/admin" element={<div>admin-početna</div>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  resetTabPageState();
});

describe('UsersRolesPage — dozvole i tabovi', () => {
  it('bez dozvola preusmjerava na /admin bez upisa taba', async () => {
    renderAt();
    await waitFor(() => expect(screen.getByText('admin-početna')).toBeInTheDocument());
    expect(screen.getByTestId('loc')).toHaveTextContent(/^\/admin$/);
    expect(state.rendered).toEqual([]);
  });

  it('samo users dozvola prikazuje korisnike bez tabova', async () => {
    state.perms = ['users.read'];
    renderAt();
    expect(screen.getByText('panel:users:true')).toBeInTheDocument();
    expect(screen.getByTestId('actions')).toBeEmptyDOMElement();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=users'));
  });

  it('samo rbac dozvola prikazuje uloge bez tabova', async () => {
    state.perms = ['rbac.read'];
    renderAt();
    expect(screen.getByText('panel:roles:true')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=roles'));
  });

  it('sa obje dozvole prikazuje oba taba i poštuje traženi', () => {
    state.perms = ['users.read', 'rbac.read'];
    renderAt('/admin/korisnici?tab=roles');
    expect(screen.getByText('panel:roles:true')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'admin.users' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'admin.roles' })).toBeInTheDocument();
  });

  it('nedozvoljen tab u URL-u zamjenjuje prvim dostupnim', async () => {
    state.perms = ['users.read'];
    renderAt('/admin/korisnici?tab=roles');
    expect(screen.getByText('panel:users:true')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=users'));
  });

  it('klik na tab mijenja panel i URL', async () => {
    const user = userEvent.setup();
    state.perms = ['users.read', 'rbac.read'];
    renderAt();
    await user.click(screen.getByRole('button', { name: 'admin.roles' }));
    expect(screen.getByText('panel:roles:true')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=roles'));
  });

  it('SEO nosi naslov stranice', () => {
    state.perms = ['users.read'];
    renderAt();
    expect(state.seo).toContain('admin.usersAndRoles');
  });
});
