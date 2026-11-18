import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeasonHubPage } from './SeasonHubPage';

const state = vi.hoisted(() => ({
  seasons: { data: undefined as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  seo: [] as string[],
  perms: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', () => ({ useSeasons: () => state.seasons }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: ({ title }: { title?: string }) => { state.seo.push(title ?? ''); return null; } }));
vi.mock('../../../components/admin/AdminBreadcrumbs', () => ({ AdminBreadcrumbs: () => <nav>bc</nav> }));
vi.mock('../../../components/ui/skeleton', () => ({ Skeleton: () => <div data-testid="skeleton" /> }));
vi.mock('./SeasonRoundsPanel', () => ({ SeasonRoundsPanel: () => <div data-testid="rounds-panel" /> }));
vi.mock('./RoundMatchesPanel', () => ({ RoundMatchesPanel: () => <div data-testid="matches-panel" /> }));

const seasons = [{ id: 'cal1', name: '2025/26', isActive: true, yearStart: 2025, yearEnd: 2026, competitions: [{ id: 'ed1', competitionId: 'c1', competition: { id: 'c1', name: 'Premijer liga', isLeague: true } }] }];

describe('A07 SeasonHubPage — P1/P2', () => {
  beforeEach(() => { state.seasons = { data: seasons as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() }; state.seo = []; state.perms = ['competitions.manage']; });
  const renderHub = (path = '/admin/seasons/cal1/competitions/ed1') => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/admin/seasons/:seasonId/competitions/:editionId" element={<SeasonHubPage />} /><Route path="/admin/seasons/:seasonId" element={<SeasonHubPage />} /></Routes></MemoryRouter>);
  it('error prikazuje alert i heading ostaje uz Seo', async () => {
    state.seasons = { data: seasons as unknown, isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    renderHub();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Premijer liga' })).toBeInTheDocument();
    expect(state.seo[0]).toBe('Premijer liga');
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(state.seasons.refetch).toHaveBeenCalled();
  });
  it('error sa isFetching disableuje retry', () => {
    state.seasons = { data: seasons as unknown, isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() };
    renderHub();
    expect(screen.getByRole('button', { name: 'admin.common.loading' })).toBeDisabled();
  });
  it('loading prikazuje skeleton aria-busy i zadržava heading', () => {
    state.seasons = { data: seasons as unknown, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() };
    renderHub();
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('heading', { name: 'Premijer liga' })).toBeInTheDocument();
  });
  it('lastUpdated i Osvježi kad ima dataUpdatedAt', async () => {
    const ts = new Date('2026-11-18T10:00:00Z').getTime();
    state.seasons = { data: seasons as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() };
    renderHub();
    expect(screen.getByText('admin.home.lastUpdated')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'admin.home.refresh' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.seasons.refetch).toHaveBeenCalled();
  });
  it('notFound ima role=status', () => {
    state.seasons = { data: seasons as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    render(<MemoryRouter initialEntries={['/admin/seasons/cal1/competitions/xxx']}><Routes><Route path="/admin/seasons/:seasonId/competitions/:editionId" element={<SeasonHubPage />} /></Routes></MemoryRouter>);
    expect(screen.getByText('admin.seasonHub.notFound').closest('[role="status"]')).toBeTruthy();
  });
});
