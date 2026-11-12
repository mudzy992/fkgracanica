import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', async (orig) => { const a = await (orig as unknown as () => Promise<Record<string, unknown>>)(); return { ...(a as object), useSeasons: vi.fn() }; });
vi.mock('../../hooks/use-season-admin', () => ({ useDeleteSeasonCompetition: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: [] } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => false }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(), dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('./SeasonEditionFormSheet', () => ({ SeasonEditionFormSheet: () => <div>SeasonEditionFormSheet</div> }));

import { useSeasons } from '../../hooks';
import { CalendarSeasonPage } from './CalendarSeasonPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter initialEntries={['/admin/seasons/s1']}><Routes><Route path="/admin/seasons/:seasonId" element={ui as any} /></Routes></MemoryRouter></QueryClientProvider>;
}
describe('fe06 CalendarSeasonPage branch53', () => {
  beforeEach(() => vi.clearAllMocks());
  it('isLoading true → skeleton', () => {
    (useSeasons as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(wrap(<CalendarSeasonPage />));
    expect(container.textContent).toBeDefined();
  });
  it('!season → seasonNotFound', () => {
    (useSeasons as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [{ id: 'other', name: 'Other', competitions: [] }], isLoading: false });
    render(wrap(<CalendarSeasonPage />));
    expect(screen.getByText('admin.calendar.seasonNotFound')).toBeInTheDocument();
  });
  it('season found with competitions fallback ?? []', () => {
    (useSeasons as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [{ id: 's1', name: 'Sezona 1', yearStart: 2024, yearEnd: 2025, isActive: true, competitions: [{ id: 'e1', competition: { name: 'Liga', isLeague: true }, participants: [{ id: '1' }] }] }], isLoading: false });
    render(wrap(<CalendarSeasonPage />));
    expect(screen.getByText('Sezona 1')).toBeInTheDocument();
  });
});
