import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersPage } from './UsersPage';
import { RolesPage } from './RolesPage';
import { UsersRolesPage } from './UsersRolesPage';

const state = vi.hoisted(() => ({
  // UsersPage
  users: {
    data: {
      data: [
        {
          id: 'u1',
          email: 'marko@fk.ba',
          firstName: 'Marko',
          lastName: 'Marić',
          isActive: true,
          roles: [{ role: { id: 'r1', name: 'Admin' } }],
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    } as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as Record<string, unknown>,
  deleteUser: { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as Record<string, unknown>,
  // RolesPage
  roles: {
    data: [
      {
        id: 'r1',
        name: 'Editor',
        description: 'Uređuje sadržaj',
        _count: { users: 2 },
        permissions: [{ permission: { key: 'news.manage' } }],
      },
    ] as unknown[],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as Record<string, unknown>,
  permissions: { data: [{ id: 'p1', key: 'news.manage', description: 'Upravljanje vijestima' }] } as unknown as Record<string, unknown>,
  updatePerms: { mutateAsync: vi.fn(async () => ({})), isPending: false, isError: false, error: null } as unknown as Record<string, unknown>,
  deleteRole: { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as Record<string, unknown>,
  // auth
  perms: ['users.read', 'rbac.read', 'users.create', 'users.update', 'users.delete', 'rbac.update'] as string[],
  confirm: vi.fn(async () => true),
  seo: [] as string[],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts?.defaultValue) {
        let s = opts.defaultValue as string;
        if (opts.time) s = s.replace('{{time}}', opts.time as string);
        if (opts.count !== undefined) s = s.replace('{{count}}', String(opts.count));
        return s;
      }
      return k;
    },
  }),
}));

vi.mock('../../hooks', () => ({
  useUsers: () => state.users,
  useRoles: () => state.roles,
  usePermissions: () => state.permissions,
}));

vi.mock('../../hooks/use-users-admin', () => ({
  useDeleteUser: () => state.deleteUser,
  useDeleteRole: () => state.deleteRole,
  useUpdateRolePermissions: () => state.updatePerms,
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: { permissions: state.perms } }),
}));

vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));

vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title ?? '');
    return null;
  },
}));

vi.mock('../../components/admin/AdminPageShell', async () => {
  const actual = (await vi.importActual('../../components/admin/AdminPageShell')) as Record<string, unknown>;
  return {
    ...(actual as object),
    AdminPageShell: ({ title, actions, children }: { title: string; actions?: unknown; children: unknown }) => (
      <div>
        <h1>{title}</h1>
        <div>{actions as never}</div>
        <div>{children as never}</div>
      </div>
    ),
    AdminDataTable: (await import('../../test/doubles/ticketing-orders-doubles')).AdminDataTableDouble,
  };
});

vi.mock('./UserAdminFormSheet', () => ({
  UserAdminFormSheet: () => <div>user-sheet</div>,
}));

vi.mock('./RolesAdminFormSheet', () => ({
  RolesAdminFormSheet: () => <div>roles-sheet</div>,
}));

vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, children }: { open: boolean; title: string; children: unknown }) =>
    open ? <section aria-label={title}>{children as never}</section> : null,
}));

vi.mock('../../components/ui/switch', async () => ({
  Switch: (await import('../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));

beforeEach(() => {
  state.users = {
    data: {
      data: [
        {
          id: 'u1',
          email: 'marko@fk.ba',
          firstName: 'Marko',
          lastName: 'Marić',
          isActive: true,
          roles: [{ role: { id: 'r1', name: 'Admin' } }],
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    } as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as typeof state.users;
  state.deleteUser = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.deleteUser;
  state.roles = {
    data: [
      {
        id: 'r1',
        name: 'Editor',
        description: 'Uređuje sadržaj',
        _count: { users: 2 },
        permissions: [{ permission: { key: 'news.manage' } }],
      },
    ] as unknown[],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as unknown as typeof state.roles;
  state.permissions = { data: [{ id: 'p1', key: 'news.manage', description: 'Upravljanje vijestima' }] } as unknown as typeof state.permissions;
  state.updatePerms = { mutateAsync: vi.fn(async () => ({})), isPending: false, isError: false, error: null } as unknown as typeof state.updatePerms;
  state.deleteRole = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.deleteRole;
  state.perms = ['users.read', 'rbac.read', 'users.create', 'users.update', 'users.delete', 'rbac.update'];
  state.confirm = vi.fn(async () => true);
  state.seo = [];
});

describe('F-01 Users/Roles — loading skeleton aria-busy (P2-2)', () => {
  it('users isLoading prikazuje skeleton aria-busy bez tabele', () => {
    state.users = {
      data: undefined as unknown,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.users;
    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    );
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
    expect(screen.queryByText('marko@fk.ba')).toBeNull();
    expect(screen.queryByText('Nema korisnika.')).toBeNull();
  });

  it('roles isLoading prikazuje skeleton aria-busy bez redova', () => {
    state.roles = {
      data: [],
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.roles;
    render(
      <MemoryRouter>
        <RolesPage />
      </MemoryRouter>,
    );
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
    expect(screen.queryByText('Editor')).toBeNull();
  });
});

describe('F-01 Users/Roles — error role=alert + retry disabled (P2-3)', () => {
  it('users isError prikazuje role=alert i retry poziva refetch, disabled dok isFetching', async () => {
    const refetch = vi.fn();
    state.users = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch,
    } as unknown as typeof state.users;
    const { rerender } = render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();
    // fetching disabled state
    state.users = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch,
    } as unknown as typeof state.users;
    rerender(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    );
    const alert2 = screen.getByRole('alert');
    const btn2 = within(alert2).getByRole('button');
    expect(btn2).toBeDisabled();
  });

  it('roles isError prikazuje role=alert i retry je disabled dok je isFetching', () => {
    state.roles = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.roles;
    render(
      <MemoryRouter>
        <RolesPage />
      </MemoryRouter>,
    );
    const alert = screen.getByRole('alert');
    expect(within(alert).getByRole('button')).toBeDisabled();
  });
});

describe('F-01 Users/Roles — lastUpdated/Osvježi + tablist a11y + global disabled (P2-4..P2-6)', () => {
  it('users success prikazuje lastUpdated i Osvježi poziva refetch, disabled dok isFetching', async () => {
    const ts = Date.now();
    const refetch = vi.fn();
    state.users = {
      data: {
        data: [
          {
            id: 'u1',
            email: 'marko@fk.ba',
            firstName: 'Marko',
            lastName: 'Marić',
            isActive: true,
            roles: [{ role: { id: 'r1', name: 'Admin' } }],
          },
        ],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      } as unknown,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch,
    } as unknown as typeof state.users;
    const { rerender } = render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();
    // fetching state disables button
    state.users = {
      data: {
        data: [
          {
            id: 'u1',
            email: 'marko@fk.ba',
            firstName: 'Marko',
            lastName: 'Marić',
            isActive: true,
            roles: [{ role: { id: 'r1', name: 'Admin' } }],
          },
        ],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      } as unknown,
      isLoading: false,
      isError: false,
      isFetching: true,
      dataUpdatedAt: ts,
      refetch,
    } as unknown as typeof state.users;
    rerender(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    );
    // button now shows loading and is disabled
    expect(screen.getByRole('button', { name: 'admin.common.loading' })).toBeDisabled();
  });

  it('roles success prikazuje lastUpdated i Osvježi poziva refetch', async () => {
    const ts = Date.now();
    const refetch = vi.fn();
    state.roles = {
      data: [
        {
          id: 'r1',
          name: 'Editor',
          description: 'Uređuje sadržaj',
          _count: { users: 2 },
          permissions: [{ permission: { key: 'news.manage' } }],
        },
      ] as unknown[],
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch,
    } as unknown as typeof state.roles;
    render(
      <MemoryRouter>
        <RolesPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();
  });

  it('tablist ima role tablist i tabovi aria-pressed/aria-selected sa i18n fallback', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/korisnici']}>
        <UsersRolesPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    // labels via defaultValue: Korisnici / Uloge
    expect(tabs[0].textContent).toBe('Korisnici');
    expect(tabs[1].textContent).toBe('Uloge');
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-pressed', 'false');
    const user = userEvent.setup();
    await user.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-pressed', 'true');
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('delete dugme u UsersPage je disabled dok je isPending (global disabled)', () => {
    state.deleteUser = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.deleteUser;
    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    );
    // Trash button has aria-label actions.delete (mock returns key), but disabled attribute should be present
    const deleteBtn = screen.getByLabelText('actions.delete');
    expect(deleteBtn).toBeDisabled();
  });
});
