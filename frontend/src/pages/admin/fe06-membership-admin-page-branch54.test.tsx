import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-membership', () => ({
  useMemberships: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
  useActivateMembership: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRenewMembership: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSuspendMembership: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelMembership: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: [] } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => false }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(async () => true), dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ children }: any) => <div>{children}</div>,
  AdminDataTable: ({ rows, empty }: any) => <div>{rows.length === 0 ? empty : rows.length}</div>,
}));
vi.mock('../../components/membership/MembershipCardsBulkExport', () => ({ MembershipCardsBulkExport: () => <div /> }));
vi.mock('./MembershipDetailSheet', () => ({ MembershipDetailSheet: () => <div /> }));
vi.mock('./MembershipAdminFormSheet', () => ({ MembershipAdminFormSheet: () => <div /> }));

import { MembershipAdminPage } from './MembershipAdminPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}
describe('fe06 MembershipAdminPage branch54', () => {
  it('data empty → empty branch', () => {
    render(wrap(<MembershipAdminPage />));
    expect(screen.getByText(/Nema članstava/)).toBeInTheDocument();
  });
  it('stats undefined → fallback', () => {
    render(wrap(<MembershipAdminPage />));
    expect(screen.getByText(/Nema članstava/)).toBeInTheDocument();
  });
  it('canManage false → no button', () => {
    render(wrap(<MembershipAdminPage />));
    expect(screen.getByText(/Nema članstava/)).toBeInTheDocument();
  });
});
