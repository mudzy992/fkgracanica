import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminSidebarNav } from './AdminSidebarNav';
import type { AdminNavGroup } from './admin-nav-groups';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const leaf = (over: Partial<AdminNavGroup['items'][number]> = {}) => ({
  to: '/admin/vijesti',
  labelKey: 'admin.nav.vijesti',
  permissions: [],
  ...over,
});

const groups: AdminNavGroup[] = [
  { labelKey: 'grupa-jedna', items: [leaf({ to: '/admin', labelKey: 'admin.dashboard', end: true })] },
  {
    labelKey: 'grupa-dva',
    items: [leaf(), leaf({ to: '/admin/galerija', labelKey: 'admin.nav.galerija' })],
  },
  {
    labelKey: 'grupa-tri',
    items: [leaf({ to: 'https://docs.fk.ba', labelKey: 'admin.nav.docs', external: true })],
  },
];

const state = { navigated: 0 };

const renderNav = (path = '/admin') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AdminSidebarNav groups={groups} onNavigate={() => { state.navigated += 1; }} />
    </MemoryRouter>,
  );

beforeEach(() => {
  state.navigated = 0;
});

describe('AdminSidebarNav — grupe', () => {
  it('grupa sa jednom stavkom prikazuje link bez prekidača', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'admin.dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /grupa-jedna/ })).toBeNull();
  });

  it('višečlana grupa je sklopljena dok nije aktivna', () => {
    renderNav('/admin');
    expect(screen.getByRole('button', { name: /grupa-dva/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'admin.nav.vijesti' })).toBeNull();
  });

  it('aktivna grupa se sama otvara', () => {
    renderNav('/admin/vijesti');
    expect(screen.getByRole('link', { name: 'admin.nav.vijesti' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'admin.nav.galerija' })).toBeInTheDocument();
  });

  it('klik na zaglavlje otvara i zatvara grupu', async () => {
    const user = userEvent.setup();
    renderNav('/admin');
    const heading = screen.getByRole('button', { name: /grupa-dva/ });
    await user.click(heading);
    expect(screen.getByRole('link', { name: 'admin.nav.vijesti' })).toBeInTheDocument();
    await user.click(heading);
    expect(screen.queryByRole('link', { name: 'admin.nav.vijesti' })).toBeNull();
  });

  it('aktivna grupa ostaje otvorena nakon prelaska na drugu rutu', () => {
    renderNav('/admin/galerija');
    expect(screen.getByRole('link', { name: 'admin.nav.vijesti' })).toBeInTheDocument();
  });
});

describe('AdminSidebarNav — stavke i navigacija', () => {
  it('aktivna ruta dobija istaknutu klasu, a ostale ne', () => {
    renderNav('/admin/vijesti');
    expect(screen.getByRole('link', { name: 'admin.nav.vijesti' }).className).toContain('bg-primary');
    expect(screen.getByRole('link', { name: 'admin.nav.galerija' }).className).not.toContain(
      'bg-primary',
    );
  });

  it('stavka sa end se ne smije poklapati s podrutom', () => {
    renderNav('/admin/podruta');
    expect(screen.getByRole('link', { name: 'admin.dashboard' }).className).not.toContain(
      'bg-primary',
    );
  });

  it('vanjski link ima sigurne atribute i ne koristi NavLink', () => {
    renderNav('/admin');
    const link = screen.getByRole('link', { name: /admin.nav.docs/ });
    expect(link).toHaveAttribute('href', 'https://docs.fk.ba');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('klik na stavku zove onNavigate', async () => {
    const user = userEvent.setup();
    renderNav('/admin');
    await user.click(screen.getByRole('link', { name: /admin.nav.docs/ }));
    expect(state.navigated).toBe(1);
  });
});
