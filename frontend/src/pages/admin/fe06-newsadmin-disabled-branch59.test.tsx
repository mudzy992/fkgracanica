import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsAdminPage } from './NewsAdminPage';

const state = vi.hoisted(() => ({
  data: [{ id: 'n1', title: 'Vijest', slug: 'vijest', status: 'DRAFT' }] as unknown as Array<Record<string, unknown>>,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  deleteMutate: vi.fn(async () => ({})),
  isPending: false,
  perms: ['news.manage'] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks', async () => {
  const actual = await vi.importActual<typeof import('../../hooks')>('../../hooks');
  return { ...actual, useNewsList: () => ({ data: state.data, isLoading: state.isLoading, isError: state.isError, refetch: state.refetch }) };
});
vi.mock('../../hooks/use-news-admin', async () => {
  const actual = await vi.importActual<typeof import('../../hooks/use-news-admin')>('../../hooks/use-news-admin');
  return { ...actual, useDeleteNews: () => ({ mutateAsync: state.deleteMutate, isPending: state.isPending }), useNewsCategories: () => ({ data: [] }), useUpdateNewsStatus: () => ({ mutateAsync: vi.fn(async () => ({})), isPending: false }) };
});
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('./NewsAdminFormSheet', () => ({ NewsAdminFormSheet: () => null }));
vi.mock('../../components/admin/ConfirmDialog', () => ({
  ConfirmDialog: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) => (
    <div>
      <button data-testid="confirm-btn" onClick={onConfirm}>
        confirm-{String(open)}
      </button>
    </div>
  ),
}));
vi.mock('../../lib/action-errors', () => ({ runAction: (p: Promise<unknown>) => p }));

describe('NewsAdminPage — deleteTarget guard (branch59) removeAttribute trik', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.perms = ['news.manage'];
    state.data = [{ id: 'n1', title: 'Vijest', slug: 'vijest', status: 'DRAFT' }] as never;
  });

  it('onConfirm sa !deleteTarget (open=false) ne poziva delete', async () => {
    const qc = new QueryClient();
    render(<QueryClientProvider client={qc}><MemoryRouter><NewsAdminPage /></MemoryRouter></QueryClientProvider>);
    const btn = screen.getByTestId('confirm-btn');
    expect(btn.textContent).toBe('confirm-false');
    fireEvent.click(btn);
    expect(state.deleteMutate).not.toHaveBeenCalled();
  });

  it('onConfirm sa deleteTarget postavljenim poziva delete', async () => {
    const qc = new QueryClient();
    render(<QueryClientProvider client={qc}><MemoryRouter><NewsAdminPage /></MemoryRouter></QueryClientProvider>);
    // Find delete button by text "Obriši" (the actual button text)
    const delBtn = screen.getByRole('button', { name: 'Obriši' });
    fireEvent.click(delBtn);
    const btn = screen.getByTestId('confirm-btn');
    expect(btn.textContent).toBe('confirm-true');
    fireEvent.click(btn);
    expect(state.deleteMutate).toHaveBeenCalled();
  });
});
