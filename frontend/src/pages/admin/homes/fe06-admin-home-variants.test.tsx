import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminHome } from './AdminHome';

const state = vi.hoisted(() => ({
  kpis: { data: { pendingMemberships: 1, pendingNews: 2, pendingLive: 3, unreadInbox: 4, activeMemberships: 5, ticketsSold: 6, publishedNews: 7, uniqueVisitorsTotal30d: 8 } as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  user: { permissions: ['finance.read'] } as unknown as { permissions: string[] } | undefined,
  cfg: {
    KPI_ROUTES: { pendingMemberships: '/a', pendingNews: '/b', pendingLive: '/c', unreadInbox: '/d', activeMemberships: '/e', ticketsSold: '/f', publishedNews: '/g', uniqueVisitorsTotal30d: '/h' } as Record<string, string>,
    KPI_LABELS: { pendingMemberships: 'L1', pendingNews: 'L2', pendingLive: 'L3', unreadInbox: 'L4', activeMemberships: 'L5', ticketsSold: 'L6', publishedNews: 'L7', uniqueVisitorsTotal30d: 'L8' } as Record<string, string>,
    KPI_ICONS: {} as Record<string, unknown>,
    QUEUE_KPI_KEYS: ['pendingMemberships', 'xMissing'] as readonly string[],
    HEALTH_KPI_KEYS: ['activeMemberships'] as readonly string[],
  },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('../../../hooks', () => ({ useDashboardKpis: () => state.kpis }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../platform-status/PlatformStatusTeaser', () => ({ PlatformStatusTeaser: () => <div /> }));
vi.mock('../dashboard-kpi-config', () => ({
  get KPI_ROUTES() { return state.cfg.KPI_ROUTES; },
  get KPI_LABELS() { return state.cfg.KPI_LABELS; },
  get KPI_ICONS() { return state.cfg.KPI_ICONS; },
  get QUEUE_KPI_KEYS() { return state.cfg.QUEUE_KPI_KEYS; },
  get HEALTH_KPI_KEYS() { return state.cfg.HEALTH_KPI_KEYS; },
}));
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual<typeof import('lucide-react')>('lucide-react');
  return { ...actual, Users: (props: unknown) => <svg data-testid="icon-users" {...(props as object)} /> };
});

const renderHome = () => render(<MemoryRouter><AdminHome /></MemoryRouter>);

beforeEach(() => {
  state.kpis = { data: { pendingMemberships: 1, pendingNews: 2, pendingLive: 3, unreadInbox: 4, activeMemberships: 5, ticketsSold: 6, publishedNews: 7, uniqueVisitorsTotal30d: 8 } as unknown, isLoading: false, isError: false, refetch: vi.fn() };
  state.user = { permissions: ['finance.read'] } as unknown as { permissions: string[] };
  state.cfg = {
    KPI_ROUTES: { pendingMemberships: '/a', pendingNews: '/b', pendingLive: '/c', unreadInbox: '/d', activeMemberships: '/e', ticketsSold: '/f', publishedNews: '/g', uniqueVisitorsTotal30d: '/h' } as Record<string, string>,
    KPI_LABELS: { pendingMemberships: 'L1', pendingNews: 'L2', pendingLive: 'L3', unreadInbox: 'L4', activeMemberships: 'L5', ticketsSold: 'L6', publishedNews: 'L7', uniqueVisitorsTotal30d: 'L8' } as Record<string, string>,
    KPI_ICONS: {} as Record<string, unknown>,
    QUEUE_KPI_KEYS: ['pendingMemberships', 'xMissing'] as readonly string[],
    HEALTH_KPI_KEYS: ['activeMemberships'] as readonly string[],
  } as unknown as typeof state.cfg;
});

describe('AdminHome — varijante (4 grane: Icon/href/label fallback)', () => {
  it('bez Icon i bez href koristi fallbackove (null Icon, prazan Link)', () => {
    state.cfg.KPI_ICONS = {} as Record<string, unknown>;
    state.cfg.KPI_ROUTES = {} as Record<string, string>;
    state.cfg.KPI_LABELS = {} as Record<string, string>;
    state.cfg.QUEUE_KPI_KEYS = ['xMissing'] as readonly string[];
    state.cfg.HEALTH_KPI_KEYS = [] as readonly string[];
    state.kpis = { data: { xMissing: 99 } as unknown, isLoading: false, isError: false, refetch: vi.fn() };
    renderHome();
    expect(screen.getByText('xMissing')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.getByText('xMissing').closest('a')).toBeNull();
  });

  it('KPI_LABELS fallback koristi key kad nema labela', () => {
    state.cfg.KPI_LABELS = {} as Record<string, string>;
    state.cfg.KPI_ICONS = {} as Record<string, unknown>;
    state.cfg.KPI_ROUTES = {} as Record<string, string>;
    state.cfg.QUEUE_KPI_KEYS = ['nepoznato'] as readonly string[];
    state.cfg.HEALTH_KPI_KEYS = [] as readonly string[];
    // need data for that key
    state.kpis = { data: { nepoznato: 42 } as unknown, isLoading: false, isError: false, refetch: vi.fn() };
    renderHome();
    expect(screen.getByText('nepoznato')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('finance link se ne dodaje bez hasPermission', () => {
    state.user = { permissions: [] } as unknown as { permissions: string[] };
    renderHome();
    expect(screen.queryByRole('link', { name: /finance/ })).toBeNull();
    expect(screen.getByText('admin.home.title')).toBeInTheDocument();
  });

  it('user undefined pokriva user?.permissions fallback', () => {
    state.user = undefined;
    renderHome();
    expect(screen.queryByRole('link', { name: /finance/ })).toBeNull();
    expect(screen.getByText('admin.home.title')).toBeInTheDocument();
  });
});
