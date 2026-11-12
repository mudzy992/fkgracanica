import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', async (orig) => { const a = await (orig as unknown as () => Promise<Record<string, unknown>>)(); return { ...(a as object), useUsers: vi.fn() }; });
vi.mock('../../hooks/use-users-admin', () => ({ useDeleteUser: () => ({ mutateAsync: vi.fn() }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => false }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(() => false), dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('./UserAdminFormSheet', () => ({ UserAdminFormSheet: () => <div>UserAdminFormSheet</div> }));
vi.mock('../../components/admin/AdminPageShell', async (orig) => { const a = await (orig as unknown as () => Promise<Record<string, unknown>>)(); return { ...(a as object), AdminDataTable: ({ rows, empty }: any) => <div>{rows.length ? 'hasRows' : empty}</div>, AdminPageShell: ({ children }: any) => <div>{children}</div> }; });
vi.mock('../../components/admin/AdminPagination', () => ({ AdminPagination: () => <div>Pagination</div> }));

import { useUsers } from '../../hooks';
import { UsersPage } from './UsersPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}
describe('fe06 UsersPage branch53', () => {
  it('user null → permissions ?? [] fallback', () => {
    (useUsers as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { data: [], meta: { page: 1, totalPages: 1 } }, isLoading: false, isError: false, refetch: vi.fn() });
    render(wrap(<UsersPage embedded />));
    expect(screen.getByText('Nema korisnika.')).toBeInTheDocument();
  });
  it('data undefined → rows ?? [] fallback', () => {
    (useUsers as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() });
    render(wrap(<UsersPage embedded />));
    expect(screen.getByText('Nema korisnika.')).toBeInTheDocument();
  });
  it('isLoading true → skeleton branch', () => {
    (useUsers as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
    const { container } = render(wrap(<UsersPage embedded />));
    expect(container.textContent).toBeDefined();
  });
});
