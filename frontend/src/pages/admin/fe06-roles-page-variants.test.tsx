import type { ReactNode } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { RolesPage } from './RolesPage';

type Role = { id: string; name: string; description?: string | null; permissions?: { permission: { key: string } }[]; _count?: { users: number } };
type Perm = { id: string; key: string; description?: string | null };
type Column = { key: string; header: string; render: (row: Role) => ReactNode };

const state = vi.hoisted(() => ({
  roles: { data: [] as unknown[] | undefined, isLoading: false, isError: false, refetch: vi.fn() },
  permissions: { data: [] as unknown[] | undefined },
  canUpdate: true,
  confirm: vi.fn(async () => true),
  updatePerms: { mutateAsync: vi.fn(async () => ({})), isError: false, isPending: false, error: null as unknown, },
  deleteRole: { mutateAsync: vi.fn(async () => ({})) },
  saveCalled: 0,
}));

vi.mock('../../hooks', () => ({
  useRoles: () => state.roles,
  usePermissions: () => state.permissions,
}));
vi.mock('../../hooks/use-users-admin', () => ({
  useDeleteRole: () => state.deleteRole,
  useUpdateRolePermissions: () => state.updatePerms,
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.canUpdate ? ['rbac.update'] : [] } }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('./RolesAdminFormSheet', () => ({
  RolesAdminFormSheet: ({ open }: { open: boolean }) => (open ? <div>novi-sheet</div> : null),
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, children, onOpenChange }: {
    open: boolean; title: string; children: ReactNode; onOpenChange?: (o: boolean) => void;
  }) => (
    <section aria-label={title} data-open={String(open)}>
      {children}
      <button onClick={() => onOpenChange?.(false)}>zatvori-sheet</button>
    </section>
  ),
}));
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isError, onRetry, actions, children }: {
    title: string; isError?: boolean; onRetry?: () => void; actions?: ReactNode; children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {actions}
      {isError ? <button onClick={onRetry}>pokušaj-ponovo</button> : children}
    </div>
  ),
  AdminDataTable: ({ rows, columns, empty }: { rows: Role[]; columns: Column[]; empty?: string }) =>
    rows.length === 0 ? <p>{empty}</p> : (
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} data-testid={`row-${row.name}`}>
              {columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    ),
}));

const role = (over: Partial<Role> = {}): Role => ({
  id: 'r1', name: 'Editor', description: 'Uređuje sadržaj', _count: { users: 3 }, permissions: [{ permission: { key: 'news.manage' } }], ...over,
});
const perms: Perm[] = [
  { id: 'p1', key: 'news.manage', description: 'Upravljanje vijestima' },
  { id: 'p2', key: 'rbac.update', description: null },
];

beforeEach(() => {
  state.roles = { data: [role({})], isLoading: false, isError: false, refetch: vi.fn() };
  state.permissions = { data: perms };
  state.canUpdate = true;
  state.confirm = vi.fn(async () => true);
  state.updatePerms = { mutateAsync: vi.fn(async () => ({})), isError: false, isPending: false, error: null };
  state.deleteRole = { mutateAsync: vi.fn(async () => ({})) };
});

describe('RolesPage — varijante pokrivanja grana (5 grana)', () => {
  it('roles undefined i permissions undefined koriste ?? [] fallback', () => {
    state.roles = { data: undefined as unknown as unknown[], isLoading: false, isError: false, refetch: vi.fn() };
    state.permissions = { data: undefined as unknown as unknown[] };
    render(<RolesPage embedded />);
    expect(screen.getByText('Nema uloga.')).toBeInTheDocument();
  });

  it('role bez permissions mapira u prazan niz i permissions length fallback 0', async () => {
    const user = userEvent.setup();
    const rNoPerms = role({ id: 'rx', name: 'BezPerm', permissions: undefined as unknown as Role['permissions'], _count: undefined });
    state.roles = { data: [rNoPerms], isLoading: false, isError: false, refetch: vi.fn() };
    state.permissions = { data: perms };
    render(<RolesPage embedded />);
    expect(within(screen.getByTestId('row-BezPerm')).getAllByText('0').length).toBe(2);
    await user.click(screen.getByRole('button', { name: 'Uredi dozvole' }));
    const sheet = screen.getByRole('region', { name: 'Dozvole: BezPerm' });
    const boxes = within(sheet).getAllByRole('checkbox') as HTMLInputElement[];
    expect(boxes.every((b) => !b.checked)).toBe(true);
    await user.click(within(sheet).getByRole('button', { name: 'Sačuvaj dozvole' }));
    await waitFor(() => expect(state.updatePerms.mutateAsync).toHaveBeenCalledWith({ roleId: 'rx', permissionKeys: [] }));
  });

  it('save bez editRole pokriva if (!editRole) return granu', async () => {
    const user = userEvent.setup();
    render(<RolesPage embedded />);
    await user.click(screen.getByRole('button', { name: 'Sačuvaj dozvole' }));
    expect(state.updatePerms.mutateAsync).not.toHaveBeenCalled();
  });

  it('permissions undefined pokriva permList fallback i perms length ?? 0 u non-embedded', () => {
    state.roles = { data: [role({ id: 'r1', name: 'AdminX', permissions: undefined as unknown as Role['permissions'] })], isLoading: false, isError: false, refetch: vi.fn() };
    state.permissions = { data: undefined as unknown as unknown[] };
    render(<RolesPage />);
    expect(screen.getByTestId('row-AdminX')).toBeInTheDocument();
    expect(within(screen.getByTestId('row-AdminX')).getByText('0')).toBeInTheDocument();
  });
});
