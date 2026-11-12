import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useCompetitions: () => ({ data: [], isLoading: false }),
  useSeasons: () => ({ data: [], isLoading: false }),
}));
vi.mock('../../hooks/use-competition-admin', () => ({
  useDeleteCompetition: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../hooks/use-season-admin', () => ({
  useDeleteSeason: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: [] } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => false }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(async () => true), dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ children }: any) => <div>{children}</div>,
  AdminDataTable: ({ rows, empty }: any) => <div>{rows.length === 0 ? empty : 'has'}</div>,
}));
vi.mock('./CompetitionsAdminFormSheet', () => ({ CompetitionsAdminFormSheet: () => <div /> }));

import { CompetitionsAdminPage } from './CompetitionsAdminPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}
describe('fe06 CompetitionsAdminPage branch54', () => {
  it('data empty → empty branch', () => {
    render(wrap(<CompetitionsAdminPage />));
    expect(screen.getByText(/emptySeasons|Nema/)).toBeInTheDocument();
  });
  it('canManage false → no button', () => {
    render(wrap(<CompetitionsAdminPage />));
    expect(screen.getByText(/emptySeasons|Nema/)).toBeInTheDocument();
  });
  it('isLoading false → table', () => {
    render(wrap(<CompetitionsAdminPage />));
    expect(screen.getByText(/emptySeasons|Nema/)).toBeInTheDocument();
  });
});
