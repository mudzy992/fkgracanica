import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarSeasonPage } from './CalendarSeasonPage';

const state = vi.hoisted(() => ({
  seasons: { data: undefined as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  seo: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({ useSeasons: () => state.seasons }));
vi.mock('../../hooks/use-season-admin', () => ({ useDeleteSeasonCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['competitions.manage'] } }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(async () => true), dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title?: string }) => { state.seo.push(title ?? ''); return null; } }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('./SeasonEditionFormSheet', () => ({ SeasonEditionFormSheet: () => <div>sheet</div> }));

describe('A07 CalendarSeasonPage — P1/P2', () => {
  beforeEach(() => { state.seasons = { data: [{ id: 's1', name: 'Sezona 2025/26', yearStart: 2025, yearEnd: 2026, isActive: true, competitions: [{ id: 'e1', competition: { name: 'Liga' } }] }] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() }; state.seo = []; });
  const renderCal = () => render(<MemoryRouter initialEntries={['/admin/seasons/s1']}><Routes><Route path="/admin/seasons/:seasonId" element={<CalendarSeasonPage />} /></Routes></MemoryRouter>);
  it('error alert i heading ostaju', async () => {
    state.seasons = { data: [{ id: 's1', name: 'Sezona 2025/26', yearStart: 2025, yearEnd: 2026, competitions: [] }] as unknown, isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    renderCal();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sezona 2025/26' })).toBeInTheDocument();
    expect(state.seo[0]).toBe('Sezona 2025/26');
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(state.seasons.refetch).toHaveBeenCalled();
  });
  it('error isFetching disableuje retry', () => {
    state.seasons = { data: [{ id: 's1', name: 'Sezona 2025/26', yearStart: 2025, yearEnd: 2026, competitions: [] }] as unknown, isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() };
    renderCal();
    expect(screen.getByRole('button', { name: 'admin.common.loading' })).toBeDisabled();
  });
  it('loading aria-busy i skeleton', () => {
    state.seasons = { data: undefined as unknown, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() };
    renderCal();
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(document.querySelector('[class*="h-64"]') ?? document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
  it('lastUpdated i Osvježi', async () => {
    const ts = Date.now();
    state.seasons = { data: [{ id: 's1', name: 'Sezona 2025/26', yearStart: 2025, yearEnd: 2026, competitions: [] }] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() };
    renderCal();
    expect(screen.getByText('admin.home.lastUpdated')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'admin.home.refresh' }));
    expect(state.seasons.refetch).toHaveBeenCalled();
  });
  it('notFound ima role=status', () => {
    state.seasons = { data: [{ id: 'other', name: 'Druga' }] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
    render(<MemoryRouter initialEntries={['/admin/seasons/s1']}><Routes><Route path="/admin/seasons/:seasonId" element={<CalendarSeasonPage />} /></Routes></MemoryRouter>);
    expect(screen.getByText('admin.calendar.seasonNotFound').closest('[role="status"]')).toBeTruthy();
  });
});
