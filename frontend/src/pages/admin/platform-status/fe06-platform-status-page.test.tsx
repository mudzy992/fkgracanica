import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformStatusPage } from './PlatformStatusPage';

const state = vi.hoisted(() => ({
  status: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  seo: [] as (string | undefined)[],
  heroes: [] as unknown[],
  cards: [] as { label: string; modules: unknown[] }[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-platform-status', () => ({ usePlatformStatus: () => state.status }));
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
    state.status = { data: payload, isLoading: false, isError: false, refetch: vi.fn() };
    state.seo = [];
    state.heroes = [];
    state.cards = [];
  });

  it('greška prikazuje poruku i ponovno učitavanje bez zaglavlja', async () => {
    state.status = { data: undefined, isLoading: false, isError: true, refetch: vi.fn() };
    render(<PlatformStatusPage />);
    expect(screen.getByText('admin.stanjeError')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'admin.stanje' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'admin.stanjeRetry' }));
    expect(state.status.refetch).toHaveBeenCalled();
  });

  it('prikazuje naslov, SEO i opis', () => {
    render(<PlatformStatusPage />);
    expect(state.seo).toContain('admin.stanje');
    expect(screen.getByRole('heading', { name: 'admin.stanje' })).toBeTruthy();
    expect(screen.getByText('admin.stanjeHint')).toBeTruthy();
  });

  it('dok se učitava prikazuje skeleton bez heroja', () => {
    state.status = { data: payload, isLoading: true, isError: false, refetch: vi.fn() };
    render(<PlatformStatusPage />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(1);
    expect(screen.queryByTestId('hero')).toBeNull();
  });

  it('bez podataka prikazuje skeleton', () => {
    state.status = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
    render(<PlatformStatusPage />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(1);
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
});
