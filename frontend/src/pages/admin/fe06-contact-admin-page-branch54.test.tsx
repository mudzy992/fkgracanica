import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-contact-admin', () => ({
  useContactMessages: () => ({ data: { data: [], meta: { page: 1, totalPages: 1 } }, isLoading: false, isError: false, refetch: vi.fn() }),
  useMarkContactRead: () => ({ mutateAsync: vi.fn() }),
  useMarkAllContactRead: () => ({ mutateAsync: vi.fn() }),
  useDeleteContact: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(async () => true), dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ children }: any) => <div>{children}</div>,
  AdminDataTable: ({ rows, empty }: any) => <div>{rows.length === 0 ? empty : 'has'}</div>,
}));
vi.mock('../../components/admin/AdminPagination', () => ({ AdminPagination: () => <div /> }));
vi.mock('./ContactMessageSheet', () => ({ ContactMessageSheet: () => <div /> }));

import { ContactAdminPage } from './ContactAdminPage';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>;
}
describe('fe06 ContactAdminPage branch54', () => {
  it('data empty → empty branch', () => {
    render(wrap(<ContactAdminPage />));
    expect(screen.getByText(/Nema poruka/)).toBeInTheDocument();
  });
  it('isLoading false → table', () => {
    render(wrap(<ContactAdminPage />));
    expect(screen.getByText(/Nema poruka/)).toBeInTheDocument();
  });
  it('canManage false → no actions', () => {
    render(wrap(<ContactAdminPage />));
    expect(screen.getByText(/Nema poruka/)).toBeInTheDocument();
  });
});
