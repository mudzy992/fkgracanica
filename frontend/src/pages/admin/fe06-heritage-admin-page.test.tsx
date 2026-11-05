import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeritageAdminPage } from './HeritageAdminPage';
import { resetTabPageState, tabPageState as state } from '../../test/doubles/tab-page-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', async () =>
  (await import('../../test/doubles/tab-page-doubles')).tabAuthModule(),
);
vi.mock('../../hooks', async () =>
  (await import('../../test/doubles/tab-page-doubles')).tabModuleFlagsModule(),
);
vi.mock('../../components/seo/Seo', async () =>
  (await import('../../test/doubles/tab-page-doubles')).tabSeoModule(),
);
vi.mock('../../components/admin/AdminPageShell', async () =>
  (await import('../../test/doubles/tab-page-doubles')).tabShellModule(),
);
vi.mock('./HallOfFameAdminPage', async () => ({
  HallOfFameAdminPage: (await import('../../test/doubles/tab-page-doubles')).panelDouble('hof'),
}));
vi.mock('./MuseumAdminPage', async () => ({
  MuseumAdminPage: (await import('../../test/doubles/tab-page-doubles')).panelDouble('muzej'),
}));

function Probe() {
  const location = useLocation();
  return <div data-testid="loc">{`${location.pathname}${location.search}`}</div>;
}

const renderAt = (path = '/admin/naslijedje') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
      <Routes>
        <Route path="/admin/naslijedje" element={<HeritageAdminPage />} />
        <Route path="/admin" element={<div>admin-početna</div>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  resetTabPageState();
});

describe('HeritageAdminPage — dozvole i moduli', () => {
  it('bez dozvola preusmjerava na /admin bez upisa taba', async () => {
    renderAt();
    await waitFor(() => expect(screen.getByText('admin-početna')).toBeInTheDocument());
    expect(screen.getByTestId('loc')).toHaveTextContent(/^\/admin$/);
    expect(state.rendered).toEqual([]);
  });

  it('isključen modul muzeja gasi tab i kad dozvola postoji', async () => {
    state.perms = ['museum.manage'];
    state.moduleFlags = { 'modules.museum': 'false' };
    renderAt();
    expect(screen.queryByText(/panel:muzej/)).toBeNull();
    await waitFor(() => expect(screen.getByText('admin-početna')).toBeInTheDocument());
  });

  it('samo hall-of-fame dozvola daje njegov panel bez tabova', async () => {
    state.perms = ['hall-of-fame.manage'];
    renderAt();
    expect(screen.getByText('panel:hof:true')).toBeInTheDocument();
    expect(screen.getByTestId('actions')).toBeEmptyDOMElement();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=hall-of-fame'));
  });

  it('samo muzej dozvola daje muzej', async () => {
    state.perms = ['museum.manage'];
    renderAt();
    expect(screen.getByText('panel:muzej:true')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=museum'));
  });
});

describe('HeritageAdminPage — tabovi', () => {
  it('sa obje dozvole prikazuje oba taba i poštuje traženi', () => {
    state.perms = ['hall-of-fame.manage', 'museum.manage'];
    renderAt('/admin/naslijedje?tab=museum');
    expect(screen.getByText('panel:muzej:true')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hall of Fame' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Muzej' })).toBeInTheDocument();
  });

  it('nedozvoljen tab u URL-u zamjenjuje prvim dostupnim', async () => {
    state.perms = ['hall-of-fame.manage'];
    renderAt('/admin/naslijedje?tab=museum');
    expect(screen.getByText('panel:hof:true')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=hall-of-fame'));
  });

  it('klik na tab mijenja panel i URL', async () => {
    const user = userEvent.setup();
    state.perms = ['hall-of-fame.manage', 'museum.manage'];
    renderAt();
    await user.click(screen.getByRole('button', { name: 'Muzej' }));
    expect(screen.getByText('panel:muzej:true')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=museum'));
  });

  it('SEO nosi naslov naslijeđa', () => {
    state.perms = ['hall-of-fame.manage'];
    renderAt();
    expect(state.seo).toContain('admin.heritage');
    expect(screen.getByRole('heading', { name: 'admin.heritage' })).toBeInTheDocument();
  });
});
