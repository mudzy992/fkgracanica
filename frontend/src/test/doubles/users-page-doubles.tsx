import { vi } from 'vitest';

/** Zajedničko stanje i dvojnici za UsersPage testove (dva fajla). */
export const usersPageState = {
  perms: [] as string[],
  rows: [] as Record<string, unknown>[],
  meta: undefined as Record<string, number> | undefined,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  calls: [] as Array<{ page?: number; search?: string }>,
  confirm: vi.fn((_options: { title: string }) => Promise.resolve(true)),
  deleteUser: vi.fn((id: string) => Promise.resolve(id)),
  sheet: {} as { open: boolean; user: Record<string, unknown> | null },
};

export const usersPageRow = (over: Record<string, unknown> = {}) => ({
  id: 'u1',
  email: 'marko@fk.ba',
  firstName: 'Marko',
  lastName: 'Marić',
  isActive: true,
  roles: [
    { role: { id: 'r1', name: 'Admin' } },
    { role: { id: 'r2', name: 'Trener' } },
  ],
  ...over,
});

export function resetUsersPageState() {
  const state = usersPageState;
  state.perms = ['users.create', 'users.update', 'users.delete'];
  state.rows = [usersPageRow()];
  state.meta = { total: 3, page: 1, limit: 20, totalPages: 3 };
  state.isLoading = false;
  state.isError = false;
  state.refetch.mockClear();
  state.calls = [];
  state.confirm.mockReset();
  state.confirm.mockResolvedValue(true);
  state.deleteUser.mockClear();
  state.sheet = { open: false, user: null };
}

export function usersAuthModule() {
  return { useAuth: () => ({ user: { permissions: usersPageState.perms } }) };
}

export function usersHooksModule() {
  return {
    useUsers: (params: { page?: number; search?: string }) => {
      usersPageState.calls.push(params);
      return {
        data: { data: usersPageState.rows, meta: usersPageState.meta },
        isLoading: usersPageState.isLoading,
        isError: usersPageState.isError,
        refetch: usersPageState.refetch,
      };
    },
  };
}

export function usersDeleteModule() {
  return {
    useDeleteUser: () => ({ mutateAsync: usersPageState.deleteUser, isPending: false }),
  };
}

export function usersConfirmModule() {
  return { useConfirm: () => ({ confirm: usersPageState.confirm, dialog: null }) };
}

export function usersSeoModule() {
  return { Seo: ({ title }: { title: string }) => <div>seo:{title}</div> };
}

export function usersSkeletonModule() {
  return { Skeleton: () => <div>skeleton</div> };
}

export function usersFormSheetModule() {
  return {
    UserAdminFormSheet: (props: { open: boolean; user: Record<string, unknown> | null }) => {
      usersPageState.sheet = { open: props.open, user: props.user };
      return (
        <div>
          korisnik-forma:{String(props.open)}:{String(props.user?.id ?? '-')}
        </div>
      );
    },
  };
}
