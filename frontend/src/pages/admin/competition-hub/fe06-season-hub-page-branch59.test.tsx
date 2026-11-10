import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SeasonHubPage } from './SeasonHubPage';

const state = vi.hoisted(() => ({
  seasons: undefined as unknown,
  isLoading: false,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', () => ({ useSeasons: () => ({ data: state.seasons, isLoading: state.isLoading }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['competitions.manage'] } }) }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../../components/admin/AdminBreadcrumbs', () => ({ AdminBreadcrumbs: () => <div /> }));
vi.mock('../../../components/ui/badge', () => ({ Badge: ({ children }: { children: unknown }) => <span>{String(children)}</span> }));
vi.mock('../../../components/ui/button', () => ({ Button: ({ children }: { children: unknown }) => <button>{String(children)}</button> }));
vi.mock('../../../components/ui/skeleton', () => ({ Skeleton: () => <div data-testid="skeleton" /> }));
vi.mock('./RoundMatchesPanel', () => ({ RoundMatchesPanel: () => <div data-testid="round-matches" /> }));
vi.mock('./SeasonRoundsPanel', () => ({
  SeasonRoundsPanel: ({ onSelectRound }: { onSelectRound: (id: string | null) => void }) => (
    <div>
      <button onClick={() => onSelectRound('r1')}>select</button>
      <button onClick={() => onSelectRound('')}>clear</button>
      <button onClick={() => onSelectRound(null as never)}>null</button>
    </div>
  ),
}));

const seasonsMock = [
  {
    id: 'cal1',
    name: 'Cal 2025/26',
    yearStart: 2025,
    yearEnd: 2026,
    isActive: true,
    competitions: [{ id: 'ed1', competition: { name: 'Liga', isLeague: true } }],
  },
] as any;

describe('SeasonHubPage branch59 coverable', () => {
  beforeEach(() => {
    state.seasons = seasonsMock;
    state.isLoading = false;
  });

  it('seasons undefined → fallback [] (seasons ?? []) and shows notFound', () => {
    state.seasons = undefined;
    render(
      <MemoryRouter initialEntries={['/admin/seasons/ed1']}>
        <Routes>
          <Route path="/admin/seasons/:seasonId" element={<SeasonHubPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('admin.seasonHub.notFound')).toBeTruthy();
  });

  it('onSelectRound with falsy id → setParams({}) cleared', () => {
    render(
      <MemoryRouter initialEntries={['/admin/seasons/ed1?roundId=r1']}>
        <Routes>
          <Route path="/admin/seasons/:seasonId" element={<SeasonHubPage />} />
        </Routes>
      </MemoryRouter>,
    );
    // initially shows RoundMatchesPanel because roundId=r1
    expect(screen.getByTestId('round-matches')).toBeInTheDocument();
    fireEvent.click(screen.getByText('clear'));
    // after clearing, should show placeholder instead of RoundMatchesPanel
    expect(screen.getByText('Odaberite kolo za upravljanje utakmicama.')).toBeInTheDocument();
  });

  it('onSelectRound null also clears', () => {
    render(
      <MemoryRouter initialEntries={['/admin/seasons/ed1?roundId=r1']}>
        <Routes>
          <Route path="/admin/seasons/:seasonId" element={<SeasonHubPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('null'));
    expect(screen.getByText('Odaberite kolo za upravljanje utakmicama.')).toBeInTheDocument();
  });
});
