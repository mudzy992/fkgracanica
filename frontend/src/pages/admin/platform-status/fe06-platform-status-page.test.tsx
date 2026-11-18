import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformStatusPage } from './PlatformStatusPage';

const state = vi.hoisted(() => ({
  status: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  },
  seo: [] as (string | undefined)[],
  heroes: [] as unknown[],
  cards: [] as { label: string; modules: unknown[] }[],
  auth: { user: { permissions: ['dashboard.read'] } as unknown },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-platform-status', () => ({ usePlatformStatus: () => state.status }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => state.auth }));
vi.mock('../../../lib/permissions', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/permissions')>(
    '../../../lib/permissions',
  );
  return { ...actual, hasPermission: (perms: string[] | undefined, key: string) => actual.hasPermission(perms, key) };
});
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('../../../components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />,
}));
vi.mock('./PlatformStatusHero', () => ({
  PlatformStatusHero: ({ data }: { data: unknown }) => {
    state.heroes.push(data);
    return <div data-testid="hero" />;
  },
}));
vi.mock('./StatusGroupCard', () => ({
  StatusGroupCard: ({ label, modules }: { label: string; modules: unknown[] }) => {
    state.cards.push({ label, modules });
    return (
      <div data-testid={`card-${label}`}>
        {label}:{modules.length}
      </div>
    );
  },
}));

const payload = {
  overallPercent: 62,
  counted: 40,
  afterLaunch: 7,
  counts: { ready: 20, in_progress: 12, web_only: 5, after_launch: 3 },
  modules: [
    { badge: 'ready', title: 'Vijesti', percent: 100, summary: 'radi', surfaces: ['web', 'admin'] },
    { badge: 'in_progress', title: 'Galerija', percent: 60, summary: 'u toku', surfaces: ['web'] },
  ],
};

describe('PlatformStatusPage', () => {
  beforeEach(() => {
    state.status = {
      data: payload as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    };
    state.seo = [];
    state.heroes = [];
    state.cards = [];
    state.auth = { user: { permissions: ['dashboard.read'] } as unknown };
  });

  it('greška prikazuje poruku, role=alert i heading ostaje', async () => {
    state.status = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    };
    render(<PlatformStatusPage />);
    expect(screen.getByText('admin.stanjeError')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'admin.stanje' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'admin.stanjeRetry' }));
    expect(state.status.refetch).toHaveBeenCalled();
  });

  it('greška sa isFetching disableuje retry i prikazuje loading', () => {
    state.status = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    };
    render(<PlatformStatusPage />);
    const btn = screen.getByRole('button', { name: 'admin.common.loading' });
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('prikazuje naslov, SEO i opis', () => {
    render(<PlatformStatusPage />);
    expect(state.seo).toContain('admin.stanje');
    expect(screen.getByRole('heading', { name: 'admin.stanje' })).toBeTruthy();
    expect(screen.getByText('admin.stanjeHint')).toBeTruthy();
  });

  it('dok se učitava prikazuje skeleton sa aria-busy bez heroja', () => {
    state.status = {
      data: payload as unknown,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    };
    render(<PlatformStatusPage />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByTestId('hero')).toBeNull();
  });

  it('bez podataka prikazuje skeleton', () => {
    state.status = {
      data: undefined as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    };
    render(<PlatformStatusPage />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThanOrEqual(1);
  });

  it('sa podacima prikazuje hero i četiri grupe sa filtriranim modulima', () => {
    render(<PlatformStatusPage />);
    expect(screen.getByTestId('hero')).toBeTruthy();
    expect(state.heroes[0]).toBe(payload);
    expect(state.cards).toHaveLength(4);
    expect(screen.getByTestId('card-admin.stanjeReady').textContent).toBe('admin.stanjeReady:1');
    expect(screen.getByTestId('card-admin.stanjeInProgress').textContent).toBe(
      'admin.stanjeInProgress:1',
    );
    expect(screen.getByTestId('card-admin.stanjeWebOnly').textContent).toBe('admin.stanjeWebOnly:0');
    expect(screen.getByTestId('card-admin.stanjeAfterLaunch').textContent).toBe(
      'admin.stanjeAfterLaunch:0',
    );
  });

  it('prikazuje lastUpdated i Osvježi kad ima dataUpdatedAt', async () => {
    const ts = new Date('2026-11-18T10:00:00.000Z').getTime();
    state.status = {
      data: payload as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch: vi.fn(),
    };
    render(<PlatformStatusPage />);
    // lastUpdated span contains admin.home.lastUpdated key
    expect(screen.getByText('admin.home.lastUpdated')).toBeTruthy();
    const btn = screen.getByRole('button', { name: 'admin.home.refresh' });
    expect(btn.hasAttribute('disabled')).toBe(false);
    await userEvent.click(btn);
    expect(state.status.refetch).toHaveBeenCalled();
  });
});
