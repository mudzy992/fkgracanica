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
  roles: { data: [] as unknown[], isLoading: false, isError: false, refetch: vi.fn() },
  permissions: { data: [] as unknown[] },
  canUpdate: true,
  confirm: vi.fn(async () => true),
  updatePerms: { mutateAsync: vi.fn(async () => ({})), isError: false, isPending: false, error: null as unknown },
  deleteRole: { mutateAsync: vi.fn(async () => ({})) },
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
  }) => (open ? (
    <section aria-label={title}>
      {children}
      <button onClick={() => onOpenChange?.(false)}>zatvori-sheet</button>
    </section>
  ) : null),
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

const role = (over: Partial<Role>): Role => ({
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

describe('RolesPage', () => {
  it('prikazuje uloge sa brojem korisnika i dozvola', () => {
    state.roles = { ...state.roles, data: [role({}), role({ id: 'r2', name: 'Gost', description: null, _count: undefined, permissions: [] })] };
    render(<RolesPage />);
    const first = screen.getByTestId('row-Editor');
    expect(within(first).getByText('3')).toBeInTheDocument();
    expect(within(first).getByText('1')).toBeInTheDocument();
    expect(within(screen.getByTestId('row-Gost')).getByText('—')).toBeInTheDocument();
  });

  it('bez dozvole rbac.update nema akcija niti dugmeta za novu ulogu', () => {
    state.canUpdate = false;
    render(<RolesPage embedded />);
    expect(screen.queryByRole('button', { name: 'Nova uloga' })).toBeNull();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Obriši' })).toBeNull();
  });

  it('sistemska uloga prikazuje oznaku, a obična dobija obje akcije', () => {
    state.roles = { ...state.roles, data: [role({ id: 'r1', name: 'Administrator' }), role({ id: 'r2', name: 'Editor' }), role({ id: 'r3', name: 'Writer' })] };
    render(<RolesPage embedded />);
    expect(within(screen.getByTestId('row-Administrator')).queryByRole('button', { name: 'Obriši' })).toBeNull();
    expect(within(screen.getByTestId('row-Editor')).getByRole('button', { name: 'Obriši' })).toBeInTheDocument();
    expect(within(screen.getByTestId('row-Writer')).queryByRole('button', { name: 'Obriši' })).toBeNull();
  });

  it('uređivanje dozvola preuzima postojeći izbor i sprema promjenu', async () => {
    const user = userEvent.setup();
    render(<RolesPage embedded />);
    await user.click(screen.getByRole('button', { name: /editPermissions|Dozvole/i }));
    const sheet = screen.getByRole('region', { name: /Dozvole: Editor/ });
    const switches = within(sheet).getAllByRole('switch');
    expect(switches[0]).toHaveAttribute('aria-checked', 'true');
    expect(switches[1]).toHaveAttribute('aria-checked', 'false');
    expect(within(sheet).getByText('Upravljanje vijestima')).toBeInTheDocument();
    expect(within(sheet).getByText('rbac.update')).toBeInTheDocument();
    await user.click(switches[0]);
    await user.click(switches[1]);
    await user.click(within(sheet).getByRole('button', { name: 'Sačuvaj dozvole' }).closest('button')!);
    await waitFor(() => expect(state.updatePerms.mutateAsync).toHaveBeenCalledWith({ roleId: 'r1', permissionKeys: ['rbac.update'] }));
    await waitFor(() => expect(screen.queryByRole('region', { name: /Dozvole: Editor/ })).toBeNull());
  });

  it('greška pri spremanju dozvola ostaje vidljiva', async () => {
    const user = userEvent.setup();
    state.updatePerms = { ...state.updatePerms, mutateAsync: vi.fn(async () => { throw new Error('403'); }), isError: true, error: {} };
    render(<RolesPage embedded />);
    await user.click(screen.getByRole('button', { name: /editPermissions|Dozvole/i }));
    const sheet = screen.getByRole('region', { name: /Dozvole: Editor/ });
    expect(within(sheet).getByText(/nije uspjelo/i)).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: 'Sačuvaj dozvole' }).closest('button')!);
    await waitFor(() => expect(state.updatePerms.mutateAsync).toHaveBeenCalled());
    expect(screen.getByRole('region', { name: /Dozvole: Editor/ })).toBeInTheDocument();
  });

  it('brisanje nakon potvrde šalje zahtjev sa tačnim id-em', async () => {
    const user = userEvent.setup();
    render(<RolesPage embedded />);
    await user.click(screen.getByRole('button', { name: 'Obriši' }));
    expect(state.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Obrisati ulogu?', description: 'Editor', variant: 'danger' }));
    await waitFor(() => expect(state.deleteRole.mutateAsync).toHaveBeenCalledWith('r1'));
  });

  it('odbijena potvrda ne briše ulogu', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    render(<RolesPage embedded />);
    await user.click(screen.getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.deleteRole.mutateAsync).not.toHaveBeenCalled();
  });

  it('nova uloga otvara obrazac, a prazna lista prikazuje poruku', async () => {
    const user = userEvent.setup();
    state.roles = { ...state.roles, data: [] };
    render(<RolesPage embedded />);
    expect(screen.getByText('Nema uloga.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nova uloga' }));
    expect(screen.getByText('novi-sheet')).toBeInTheDocument();
  });

  it('učitavanje prikazuje skeletone, a greška dugme za ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.roles = { ...state.roles, isLoading: true };
    const { unmount } = render(<RolesPage />);
    expect(screen.queryByRole('table')).toBeNull();
    unmount();
    const refetch = vi.fn();
    state.roles = { ...state.roles, isLoading: false, isError: true, refetch };
    render(<RolesPage />);
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('zatvaranje sheeta dozvola poništava odabranu ulogu', async () => {
    const user = userEvent.setup();
    render(<RolesPage embedded />);
    await user.click(screen.getByRole('button', { name: /editPermissions|Dozvole/i }));
    const sheet = screen.getByRole('region', { name: /Dozvole: Editor/ });
    await user.click(within(sheet).getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.queryByRole('region', { name: /Dozvole: Editor/ })).toBeNull();
  });
});
