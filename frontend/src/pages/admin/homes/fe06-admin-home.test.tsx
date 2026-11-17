import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminHome } from './AdminHome';

const state = vi.hoisted(() => ({
  kpis: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  permissions: [] as string[],
  seo: [] as (string | undefined)[],
  teaser: 0,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../../hooks', () => ({ useDashboardKpis: () => state.kpis }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('../platform-status/PlatformStatusTeaser', () => ({
  PlatformStatusTeaser: () => {
    state.teaser += 1;
    return <div data-testid="status-teaser" />;
  },
}));

const data = {
  users: 120,
  pendingMemberships: 5,
  pendingNews: 2,
  pendingLive: 0,
  unreadInbox: 7,
  activeMemberships: 88,
  ticketsSold: 410,
  publishedNews: 34,
  uniqueVisitorsTotal30d: 999,
};

const renderHome = () =>
  render(
    <MemoryRouter>
      <AdminHome />
    </MemoryRouter>,
  );

describe('AdminHome', () => {
  beforeEach(() => {
    state.kpis = { data: undefined, isLoading: false, isError: false, refetch: vi.fn(), isFetching: false, dataUpdatedAt: undefined } as unknown as typeof state.kpis;
    state.permissions = ['dashboard.read', 'cms.manage', 'users.read', 'settings.read', 'live.approve'];
    state.seo = [];
    state.teaser = 0;
  });

  it('prikazuje naslov, podnaslov, SEO i teaser statusa', () => {
    state.permissions = ['dashboard.read', 'cms.manage', 'users.read', 'settings.read', 'live.approve', 'membership.manage', 'news.approve', 'contact.read', 'finance.read', 'news.manage', 'analytics.read'];
    state.kpis = { data, isLoading: false, isError: false, refetch: vi.fn(), isFetching: false, dataUpdatedAt: Date.now() } as unknown as typeof state.kpis;
    renderHome();
    expect(state.seo).toContain('admin.home.metaTitle');
    expect(state.teaser).toBe(1);
    expect(screen.getByRole('heading', { name: 'admin.home.title' })).toBeTruthy();
    expect(screen.getByText('admin.home.subtitle')).toBeTruthy();
  });

  it('dok nema podataka prikazuje se učitavanje sa skeletonom', () => {
    state.kpis = { data: undefined, isLoading: true, isError: false, refetch: vi.fn(), dataUpdatedAt: undefined, isFetching: false } as unknown as typeof state.kpis;
    renderHome();
    expect(screen.getByText('admin.home.queue')).toBeTruthy();
    expect(screen.queryByText('admin.home.health')).toBeNull();
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('greška prikazuje poruku i ponovno učitavanje bez KPI sekcija', async () => {
    state.kpis = { data: undefined, isLoading: false, isError: true, refetch: vi.fn(), isFetching: false } as unknown as typeof state.kpis;
    renderHome();
    expect(screen.getByText('admin.home.kpiError')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.queryByText('admin.home.queue')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(state.kpis.refetch).toHaveBeenCalled();
  });

  it('KPI vrijednosti su prikazane u redovima i vode na svoje rute', () => {
    state.permissions = [
      'dashboard.read',
      'membership.manage',
      'news.approve',
      'live.approve',
      'contact.read',
      'finance.read',
      'news.manage',
      'analytics.read',
    ];
    state.kpis = { data, isLoading: false, isError: false, refetch: vi.fn(), isFetching: false } as unknown as typeof state.kpis;
    renderHome();
    expect(screen.getByText('admin.home.queue')).toBeTruthy();
    expect(screen.getByText('admin.home.health')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('999')).toBeTruthy();
    expect(screen.getByRole('link', { name: /999/ }).getAttribute('href')).toBe('/admin/analytics');
    expect(screen.getByRole('link', { name: /410/ }).getAttribute('href')).toBe('/admin/ticketing');
  });

  it('svih osam KPI kartica su linkovi sa oznakom Otvori', () => {
    state.permissions = [
      'dashboard.read',
      'membership.manage',
      'news.approve',
      'live.approve',
      'contact.read',
      'finance.read',
      'news.manage',
      'analytics.read',
    ];
    state.kpis = { data, isLoading: false, isError: false, refetch: vi.fn(), isFetching: false } as unknown as typeof state.kpis;
    renderHome();
    expect(screen.getAllByText('admin.home.open')).toHaveLength(8);
  });

  it('quick akcije sadrže osnovne rute bez finansija bez dozvole', () => {
    state.permissions = ['dashboard.read', 'cms.manage', 'users.read', 'settings.read', 'live.approve'];
    state.kpis = { data, isLoading: false, isError: false, refetch: vi.fn(), isFetching: false } as unknown as typeof state.kpis;
    renderHome();
    expect(screen.getByRole('link', { name: 'admin.cms' }).getAttribute('href')).toBe('/admin/cms');
    expect(screen.getByRole('link', { name: 'admin.usersAndRoles' }).getAttribute('href')).toBe('/admin/users');
    expect(screen.getByRole('link', { name: 'admin.settings' }).getAttribute('href')).toBe('/admin/settings');
    expect(screen.getByRole('link', { name: 'admin.livePending' }).getAttribute('href')).toBe(
      '/admin/live/pending',
    );
    expect(screen.queryByRole('link', { name: 'admin.finance' })).toBeNull();
  });

  it('finansije su dostupne uz finance.read', () => {
    state.permissions = ['dashboard.read', 'cms.manage', 'users.read', 'settings.read', 'live.approve', 'finance.read'];
    state.kpis = { data, isLoading: false, isError: false, refetch: vi.fn(), isFetching: false } as unknown as typeof state.kpis;
    renderHome();
    expect(screen.getByRole('link', { name: 'admin.finance' }).getAttribute('href')).toBe('/admin/finance');
  });
});
