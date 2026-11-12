import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeasonHubPage } from './SeasonHubPage';

const state = vi.hoisted(() => ({
  seasons: { data: undefined as unknown, isLoading: false },
  permissions: [] as string[],
  seo: [] as (string | undefined)[],
  crumbs: [] as unknown[],
  rounds: [] as Record<string, unknown>[],
  matches: [] as Record<string, unknown>[],
  location: '',
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', () => ({ useSeasons: () => state.seasons }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
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
vi.mock('./SeasonRoundsPanel', () => ({
  SeasonRoundsPanel: (props: Record<string, unknown>) => {
    state.rounds.push(props);
    return <div data-testid="rounds-panel" />;
  },
}));
vi.mock('./RoundMatchesPanel', () => ({
  RoundMatchesPanel: (props: Record<string, unknown>) => {
    state.matches.push(props);
    return <div data-testid="matches-panel" />;
  },
}));

const seasons = [
  {
    id: 'cal1',
    name: '2025/26',
    isActive: true,
    yearStart: 2025,
    yearEnd: 2026,
    competitions: [
      {
        id: 'ed1',
        competitionId: 'comp1',
        competition: { id: 'comp1', name: 'Premijer liga', isLeague: true },
      },
      { id: 'ed2', competitionId: 'comp2', competition: { id: 'comp2', name: 'Kup' } },
    ],
  },
];

const LocationProbe = () => {
  const location = useLocation();
  state.location = location.pathname + location.search;
  return null;
};

const renderPage = (path = '/admin/seasons/cal1/editions/ed1') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <Routes>
        <Route path="/admin/seasons/:seasonId/editions/:editionId" element={<SeasonHubPage />} />
        <Route path="/admin/seasons/:seasonId" element={<SeasonHubPage />} />
        <Route path="*" element={<p>druga</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('SeasonHubPage', () => {
  beforeEach(() => {
    state.seasons = { data: seasons, isLoading: false };
    state.permissions = ['competitions.manage'];
    state.seo = [];
    state.crumbs = [];
    state.rounds = [];
    state.matches = [];
    state.location = '';
  });

  it('dok se sezone učitavaju prikazuje skeleton', () => {
    state.seasons = { data: undefined, isLoading: true };
    renderPage();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(1);
  });

  it('nepoznata edicija prikazuje poruku', () => {
    state.seasons = { data: seasons, isLoading: false };
    renderPage('/admin/seasons/cal1/editions/nepostoji');
    expect(screen.getByText('admin.seasonHub.notFound')).toBeTruthy();
  });

  it('prikazuje naslov takmičenja, sezonu i bedževe', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Premijer liga' })).toBeTruthy();
    expect(screen.getByText('2025/26 · 2025/2026')).toBeTruthy();
    expect(screen.getByText('admin.competitionForm.activeSeason')).toBeTruthy();
    expect(screen.getByText('admin.competitionsAdmin.league')).toBeTruthy();
    expect(state.seo).toContain('Premijer liga');
  });

  it('bez aktivne sezone i lige nema bedževa', () => {
    state.seasons = {
      data: [
        {
          id: 'cal1',
          name: '2024/25',
          isActive: false,
          yearStart: 2024,
          yearEnd: 2025,
          competitions: [{ id: 'ed1', competitionId: 'c', competition: { name: 'Kup' } }],
        },
      ],
      isLoading: false,
    };
    renderPage();
    expect(screen.queryByText('admin.competitionForm.activeSeason')).toBeNull();
    expect(screen.queryByText('admin.competitionsAdmin.league')).toBeNull();
  });

  it('breadcrumbs vode do admina, takmičenja i sezone', () => {
    renderPage();
    expect(state.crumbs[0]).toEqual([
      { label: 'Admin', to: '/admin' },
      { label: 'Takmičenja', to: '/admin/competitions' },
      { label: '2025/26', to: '/admin/seasons/cal1' },
      { label: 'Premijer liga' },
    ]);
  });

  it('bez odabranog kola prikazuje uputstvo i ne renderuje panel utakmica', () => {
    renderPage();
    expect(screen.getByText('Odaberite kolo za upravljanje utakmicama.')).toBeTruthy();
    expect(screen.queryByTestId('matches-panel')).toBeNull();
    expect(state.rounds[0]).toEqual(
      expect.objectContaining({ seasonId: 'ed1', selectedRoundId: null, canManage: true }),
    );
  });

  it('odabrano kolo se čita iz URL-a i prosljeđuje oba panela', () => {
    renderPage('/admin/seasons/cal1/editions/ed1?roundId=r7');
    expect(screen.getByTestId('matches-panel')).toBeTruthy();
    expect(state.matches[0]).toEqual({ seasonId: 'ed1', roundId: 'r7', canManage: true });
    expect(state.rounds[0]).toEqual(expect.objectContaining({ selectedRoundId: 'r7' }));
  });

  it('odabir kola upisuje roundId u URL, a prazan ga briše', async () => {
    renderPage();
    const props = state.rounds[0] as { onSelectRound: (id: string) => void };
    props.onSelectRound('r7');
    expect(await screen.findByTestId('matches-panel')).toBeTruthy();
    expect(state.location).toContain('roundId=r7');
  });

  it('korisnik sa matches.manage može upravljati', () => {
    state.permissions = ['matches.manage'];
    renderPage();
    expect(state.rounds[0]).toEqual(expect.objectContaining({ canManage: true }));
  });

  it('korisnik bez dozvola ne može upravljati', () => {
    state.permissions = [];
    renderPage();
    expect(state.rounds[0]).toEqual(expect.objectContaining({ canManage: false }));
  });

  it('bez imena takmičenja koristi se naziv sezone', () => {
    state.seasons = {
      data: [
        {
          id: 'cal1',
          name: '2025/26',
          yearStart: 2025,
          yearEnd: 2026,
          competitions: [{ id: 'ed1', competitionId: 'c' }],
        },
      ],
      isLoading: false,
    };
    renderPage();
    expect(screen.getByRole('heading', { name: 'Takmičenje' })).toBeTruthy();
    expect(state.seo).toContain('2025/26');
  });
});

