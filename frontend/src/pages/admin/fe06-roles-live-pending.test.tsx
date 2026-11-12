import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RolesAdminFormSheet } from './RolesAdminFormSheet';

vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isError, onRetry, children }: {
    title: string; isError?: boolean; onRetry?: () => void; children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {isError && <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>}
      {children}
    </div>
  ),
  AdminDataTable: ({ rows, empty, columns }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    empty?: string;
    columns: Array<{ key: string; render: (row: never) => ReactNode }>;
  }) =>
    rows.length === 0 ? (
      <p>{empty}</p>
    ) : (
      <div>
        {rows.map((row) => (
          <div key={row.id} data-testid={`row-${row.id}`}>
            {columns.map((column) => (
              <span key={column.key} data-col={column.key}>{column.render(row as never)}</span>
            ))}
          </div>
        ))}
      </div>
    ),
}));

const state = vi.hoisted(() => ({
  create: {
    mutateAsync: vi.fn(async () => ({})),
    isPending: false,
    isError: false,
    error: undefined as unknown,
  },
  pending: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  approve: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  seo: [] as (string | undefined)[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-users-admin', () => ({ useCreateRole: () => state.create }));
vi.mock('../../hooks/use-live-admin', () => ({
  usePendingLiveReports: () => state.pending,
  useApproveMatchReport: () => state.approve,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) =>
    open ? <section aria-label={title}>{children}</section> : null,
}));

describe('RolesAdminFormSheet', () => {
  beforeEach(() => {
    state.create = {
      mutateAsync: vi.fn(async () => ({})),
      isPending: false,
      isError: false,
      error: undefined,
    };
  });

  it('zatvoren sheet ne prikazuje formu', () => {
    render(<RolesAdminFormSheet open={false} onOpenChange={() => {}} />);
    expect(screen.queryByLabelText('admin.rolesForm.create')).toBeNull();
  });

  it('dugme je onemogućeno dok nema naziva role', async () => {
    render(<RolesAdminFormSheet open onOpenChange={() => {}} />);
    const button = screen.getByRole('button', { name: 'actions.create' });
    expect(button).toHaveProperty('disabled', true);
    await userEvent.type(screen.getByPlaceholderText('admin.rolesForm.name'), 'Urednik');
    expect(button).toHaveProperty('disabled', false);
  });

  it('kreira rolu sa nazivom i opisom te zatvara sheet', async () => {
    const onOpenChange = vi.fn();
    render(<RolesAdminFormSheet open onOpenChange={onOpenChange} />);
    await userEvent.type(screen.getByPlaceholderText('admin.rolesForm.name'), 'Urednik');
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.description'), 'Vodi vijesti');
    await userEvent.click(screen.getByRole('button', { name: 'actions.create' }));
    expect(state.create.mutateAsync).toHaveBeenCalledWith({ name: 'Urednik', description: 'Vodi vijesti' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('prazan opis se ne šalje', async () => {
    render(<RolesAdminFormSheet open onOpenChange={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText('admin.rolesForm.name'), 'Urednik');
    await userEvent.click(screen.getByRole('button', { name: 'actions.create' }));
    expect(state.create.mutateAsync).toHaveBeenCalledWith({ name: 'Urednik', description: undefined });
  });

  it('greška mutacije prikazuje poruku i sheet ostaje otvoren', async () => {
    const onOpenChange = vi.fn();
    state.create = {
      mutateAsync: vi.fn(async () => {
        throw new Error('duplikat');
      }),
      isPending: false,
      isError: true,
      error: new Error('Role već postoji'),
    };
    render(<RolesAdminFormSheet open onOpenChange={onOpenChange} />);
    await userEvent.type(screen.getByPlaceholderText('admin.rolesForm.name'), 'Urednik');
    await userEvent.click(screen.getByRole('button', { name: 'actions.create' }));
    expect(await screen.findByText('Role već postoji')).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('tokom kreiranja dugme je onemogućeno', async () => {
    state.create = {
      mutateAsync: vi.fn(async () => ({})),
      isPending: true,
      isError: false,
      error: undefined,
    };
    render(<RolesAdminFormSheet open onOpenChange={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText('admin.rolesForm.name'), 'Urednik');
    expect(screen.getByRole('button', { name: 'actions.create' })).toHaveProperty('disabled', true);
  });
});
