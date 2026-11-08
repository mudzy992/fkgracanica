import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubHubPage } from './ClubHubPage';

const state = vi.hoisted(() => ({
  club: { id: 'c1', name: 'FK Gračanica', isOwnClub: true } as unknown as Record<string, unknown>,
  isLoading: false,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-club-hub', () => ({ useClub: () => ({ data: state.club, isLoading: state.isLoading }) }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../../components/admin/AdminBreadcrumbs', () => ({ AdminBreadcrumbs: () => <div>bcrumbs</div> }));
vi.mock('./ClubHubPanel', () => ({ ClubHubPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('./tabs/ClubBasicTab', () => ({ ClubBasicTab: () => <div>basic-tab</div> }));
vi.mock('./tabs/ClubStadiumTab', () => ({ ClubStadiumTab: () => <div>stadium-tab</div> }));
vi.mock('./tabs/ClubPlayersTab', () => ({ ClubPlayersTab: () => <div>players-tab</div> }));
vi.mock('./tabs/ClubFormationTab', () => ({ ClubFormationTab: () => <div>formation-tab</div> }));
vi.mock('./tabs/ClubStatsTab', () => ({ ClubStatsTab: () => <div>stats-tab</div> }));

beforeEach(() => {
  state.club = { id: 'c1', name: 'FK Gračanica', isOwnClub: true } as unknown as never;
  state.isLoading = false;
});

const renderWithTab = (tab?: string) => {
  const entry = tab ? `/admin/clubs/c1?tab=${tab}` : '/admin/clubs/c1';
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <ClubHubPage />
    </MemoryRouter>,
  );
};

describe('ClubHubPage — branch43 (2 grane)', () => {
  it('formation tab prikazuje formation-tab', () => {
    renderWithTab('formation');
    expect(screen.getByText('formation-tab')).toBeInTheDocument();
    expect(screen.queryByText('stats-tab')).toBeNull();
  });

  it('stats tab prikazuje stats-tab', () => {
    renderWithTab('stats');
    expect(screen.getByText('stats-tab')).toBeInTheDocument();
    expect(screen.queryByText('formation-tab')).toBeNull();
  });

  it('basic tab fallback (bez tab param)', () => {
    renderWithTab();
    expect(screen.getByText('basic-tab')).toBeInTheDocument();
  });
});
