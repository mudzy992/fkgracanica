import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useCreateSeason, useUpdateSeason, useDeleteSeason, useAddSeasonCompetition,
  useUpdateSeasonCompetition, useDeleteSeasonCompetition,
} from './use-season-admin';
import {
  useCreateUser, useUpdateUser, useDeleteUser, useUserRoleOptions,
  useUpdateRolePermissions, useCreateRole, useDeleteRole,
} from './use-users-admin';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

async function mutate(hook: () => unknown, wrapper: (props: { children: ReactNode }) => ReactNode, vars: unknown) {
  const { result } = renderHook(() => hook() as never, { wrapper });
  await act(async () => {
    await (result.current as never as { mutateAsync: (v: unknown) => Promise<unknown> }).mutateAsync(vars);
  });
}

describe('sezone: admin hookovi', () => {
  it.each([
    { name: 'create', hook: useCreateSeason, method: 'post', path: '/seasons', vars: { name: '2026/27', yearStart: 2026, yearEnd: 2027 }, body: { name: '2026/27', yearStart: 2026, yearEnd: 2027 } },
    { name: 'update', hook: useUpdateSeason, method: 'patch', path: '/seasons/s1', vars: { id: 's1', isActive: true }, body: { isActive: true } },
    { name: 'delete', hook: useDeleteSeason, method: 'delete', path: '/seasons/s1', vars: 's1' },
    { name: 'dodaj takmičenje', hook: useAddSeasonCompetition, method: 'post', path: '/seasons/s1/competitions', vars: { seasonId: 's1', name: 'Kup', clubIds: ['c1'] }, body: { name: 'Kup', clubIds: ['c1'] } },
    { name: 'izmijeni takmičenje', hook: useUpdateSeasonCompetition, method: 'patch', path: '/seasons/s1/competitions/e1', vars: { seasonId: 's1', editionId: 'e1', clubIds: ['c2'] }, body: { clubIds: ['c2'] } },
    { name: 'obriši takmičenje', hook: useDeleteSeasonCompetition, method: 'delete', path: '/seasons/s1/competitions/e1', vars: { seasonId: 's1', editionId: 'e1' } },
  ])('$name šalje tačan zahtjev i invalidira sezone', async ({ hook, method, path, vars, body }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api[method as keyof typeof api].mockResolvedValue({ data: { ok: true } });
    await mutate(hook, wrapper, vars);
    if (body === undefined) expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path);
    else expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path, body);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['seasons'] });
  });

  it('dodavanje takmičenja invalidira i sezone i takmičenja', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValue({ data: { ok: true } });
    await mutate(useAddSeasonCompetition, wrapper, { seasonId: 's1' });
    expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual([['seasons'], ['competitions']]);
  });
});

describe('korisnici i role: admin hookovi', () => {
  it('opcije rola se čitaju sa tačne putanje', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: [{ id: 'r1', name: 'ADMIN' }] });
    const { result } = renderHook(() => useUserRoleOptions(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/users/role-options');
    expect(result.current.data).toEqual([{ id: 'r1', name: 'ADMIN' }]);
  });

  it.each([
    { name: 'create', hook: useCreateUser, method: 'post', path: '/users', vars: { email: 'a@b.c', password: 'tajna' }, body: { email: 'a@b.c', password: 'tajna' }, key: ['users'] },
    { name: 'update', hook: useUpdateUser, method: 'patch', path: '/users/u1', vars: { id: 'u1', isActive: false }, body: { isActive: false }, key: ['users'] },
    { name: 'delete', hook: useDeleteUser, method: 'delete', path: '/users/u1', vars: 'u1', key: ['users'] },
    { name: 'dozvole role', hook: useUpdateRolePermissions, method: 'patch', path: '/rbac/roles/r1/permissions', vars: { roleId: 'r1', permissionKeys: ['a'] }, body: { permissionKeys: ['a'] }, key: ['roles'] },
    { name: 'create role', hook: useCreateRole, method: 'post', path: '/rbac/roles', vars: { name: 'EDITOR' }, body: { name: 'EDITOR' }, key: ['roles'] },
    { name: 'delete role', hook: useDeleteRole, method: 'delete', path: '/rbac/roles/r1', vars: 'r1', key: ['roles'] },
  ])('$name šalje tačan zahtjev i invalidira $key', async ({ hook, method, path, vars, body, key }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    api[method as keyof typeof api].mockResolvedValue({ data: { ok: true } });
    await mutate(hook, wrapper, vars);
    if (body === undefined) expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path);
    else expect(api[method as keyof typeof api]).toHaveBeenCalledWith(path, body);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: key });
  });
});
