import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMyMembership, useMemberships, useMembershipDetail, useRegisterMembership, useCreateMembershipAdmin,
  useActivateMembership, useRenewMembership, useSuspendMembership, useCancelMembership } from './use-membership';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

describe('membership query i mutacije', () => {
  beforeEach(() => { api.get.mockReset(); api.post.mockReset(); api.patch.mockReset(); });
  afterEach(() => vi.restoreAllMocks());

  it('normalizuje liste i ne traži detalj bez ID-a', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: { data: [{ id: 'm1', status: 'ACTIVE' }] } });
    const hook = renderHook(() => ({ mine: useMyMembership(), list: useMemberships('ACTIVE'), detail: useMembershipDetail() }), { wrapper });
    await waitFor(() => expect(hook.result.current.mine.isSuccess && hook.result.current.list.isSuccess).toBe(true));
    expect(hook.result.current.mine.data).toEqual([{ id: 'm1', status: 'ACTIVE' }]);
    expect(api.get).toHaveBeenCalledWith('/membership/me');
    expect(api.get).toHaveBeenCalledWith('/membership', { params: { status: 'ACTIVE' } });
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it.each([
    { name: 'activate', hook: useActivateMembership }, { name: 'renew', hook: useRenewMembership },
    { name: 'suspend', hook: useSuspendMembership }, { name: 'cancel', hook: useCancelMembership },
  ])('$name šalje ID, invalidira oba membership ključa samo poslije uspjeha', async ({ name, hook }) => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();
    api.patch.mockResolvedValueOnce({ data: { id: 'm1' } }).mockRejectedValueOnce(new Error('403'));
    const result = renderHook(() => hook(), { wrapper });
    await act(async () => { await result.result.current.mutateAsync('m1'); });
    expect(api.patch).toHaveBeenCalledWith(`/membership/m1/${name}`);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['membership'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['membership', 'me'] });
    invalidate.mockClear();
    await act(async () => { await expect(result.result.current.mutateAsync('m1')).rejects.toThrow('403'); });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('registracija i admin kreiranje osvježavaju odgovarajuće ključeve', async () => {
    const { qc, wrapper } = setup();
    const invalidate = vi.spyOn(qc, 'invalidateQueries').mockResolvedValue();
    api.post.mockResolvedValue({ data: { id: 'm1' } });
    const result = renderHook(() => ({ self: useRegisterMembership(), admin: useCreateMembershipAdmin() }), { wrapper });
    await act(async () => { await result.result.current.self.mutateAsync(); });
    await act(async () => { await result.result.current.admin.mutateAsync({ email: 'test@example.test', activate: true }); });
    expect(api.post).toHaveBeenCalledWith('/membership/register');
    expect(api.post).toHaveBeenCalledWith('/membership/admin', { email: 'test@example.test', activate: true });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['membership', 'me'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['membership'] });
  });
});
