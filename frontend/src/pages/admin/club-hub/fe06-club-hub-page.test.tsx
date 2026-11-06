import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubHubPage } from './ClubHubPage';

const state = vi.hoisted(() => ({
  club: { data: undefined as unknown, isLoading: false },
  seo: [] as (string | undefined)[],
  crumbs: [] as unknown[],
  panels: [] as string[],
  path: '',
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-club-hub', () => ({ useClub: (id: string) => (state.panels.push(id), state.club) }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('../../../components/admin/AdminBreadcrumbs', () => ({
  AdminBreadcrumbs: ({ items }: { items: unknown }) => {
    state.crumbs.push(items);
    return <nav>breadcrumbs</nav>;
  },
}));
vi.mock('../../../components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />,
}));
vi.mock('./tabs/ClubBasicTab', () => ({
  ClubBasicTab: ({ club }: { club: { name: string } }) => <div data-testid="tab-basic">osnovno:{club.name}</div>,
}));
vi.mock('./tabs/ClubStadiumTab', () => ({
  ClubStadiumTab: ({ clubId }: { clubId: string }) => <div data-testid="tab-stadium">{clubId}</div>,
}));
vi.mock('./tabs/ClubPlayersTab', () => ({
  ClubPlayersTab: ({ clubId }: { clubId: string }) => <div data-testid="tab-players">{clubId}</div>,
}));
vi.mock('./tabs/ClubFormationTab', () => ({
  ClubFormationTab: ({ clubId }: { clubId: string }) => <div data-testid="tab-formation">{clubId}</div>,
}));
vi.mock('./tabs/ClubStatsTab', () => ({
  ClubStatsTab: ({ clubId }: { clubId: string }) => <div data-testid="tab-stats">{clubId}</div>,
}));

const club = (over: Record<string, unknown> = {}) => ({
  id: 'c1',
  name: 'FK Gračanica',
  isOwnClub: true,
  ...over,
});

const LocationProbe = () => {
  const location = useLocation();
  state.path = `${location.pathname}${location.search}`;
  return null;
};

const renderPage = (path = '/admin/clubs/c1') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <Routes>
        <Route path="/admin/clubs/:id" element={<ClubHubPage />} />
        <Route path="*" element={<p>druga</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ClubHubPage', () => {
  beforeEach(() => {
    state.club = { data: club(), isLoading: false };
    state.seo = [];
    state.crumbs = [];
    state.panels = [];
    state.path = '';
  });

  it('dok se klub učitava prikazuje skeleton', () => {
    state.club = { data: undefined, isLoading: true };
    renderPage();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(1);
  });

  it('nepoznat klub prikazuje poruku', () => {
    state.club = { data: undefined, isLoading: false };
    renderPage();
    expect(screen.getByText('admin.clubHub.notFound')).toBeTruthy();
  });

  it('prikazuje naziv, bedž vlastitog kluba i SEO', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'FK Gračanica' })).toBeTruthy();
    expect(screen.getByText('admin.club.ownClub')).toBeTruthy();
    expect(state.seo).toContain('FK Gračanica');
    expect(
      screen.getByText('Upravljanje klubom, kadrom, stadionom i statistikama'),
    ).toBeTruthy();
  });

  it('protivnički klub ima sivi bedž', () => {
    state.club = { data: club({ isOwnClub: false }), isLoading: false };
    renderPage();
    expect(screen.getByText('admin.clubsList.opponent')).toBeTruthy();
  });

  it('breadcrumbs vode do admina i liste klubova', () => {
    renderPage();
    expect(state.crumbs[0]).toEqual([
      { label: 'Admin', to: '/admin' },
      { label: 'Klub', to: '/admin/clubs' },
      { label: 'FK Gračanica' },
    ]);
  });

  it('podrazumijevani tab je Osnovno', () => {
    renderPage();
    expect(screen.getByTestId('tab-basic').textContent).toBe('osnovno:FK Gračanica');
    expect(screen.queryByTestId('tab-stadium')).toBeNull();
  });

  it('tab iz URL-a otvara odgovarajući panel', () => {
    renderPage('/admin/clubs/c1?tab=formation');
    expect(screen.getByTestId('tab-formation').textContent).toBe('c1');
  });

  it('klik na tab mijenja panel i URL', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Stadion' }));
    expect(await screen.findByTestId('tab-stadium')).toBeTruthy();
    expect(state.path).toBe('/admin/clubs/c1?tab=stadium');
  });

  it('svi tabovi su dostupni u traci', () => {
    renderPage();
    ['Osnovno', 'Stadion', 'Igrači', 'Formacija', 'Statistike'].forEach((label) =>
      expect(screen.getByRole('button', { name: label })).toBeTruthy(),
    );
  });

  it('nazad vodi na listu klubova', () => {
    renderPage();
    const back = document.querySelector('a[href="/admin/clubs"]');
    expect(back).toBeTruthy();
    expect(screen.getByRole('button', { name: 'actions.back' })).toBeTruthy();
  });
});

void (null as ReactNode | null);
