import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useRounds, useCreateRound, useUpdateRound, useRoundDeleteImpact, useDeleteRound,
} from './use-rounds';
import {
  financeParams, useFinanceSummary, downloadFinanceExport, type FinanceFilters,
} from './use-finance-summary';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

const empty: FinanceFilters = { from: '', to: '', provider: '', status: '' };
const filled: FinanceFilters = { from: '2026-01-01', to: '2026-02-01', provider: 'stripe', status: 'PAID' };

beforeEach(() => {
  Object.values(api).forEach((mock) => mock.mockReset());
  api.get.mockResolvedValue({ data: {} });
  api.post.mockResolvedValue({ data: {} });
  api.patch.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });
});

describe('kola (rounds): upiti i mutacije', () => {
  it('lista se traži samo uz sezonu i prosljeđuje seasonId', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: [{ id: 'r1' }] });
    const hook = renderHook(({ id }: { id?: string }) => useRounds(id), {
      wrapper, initialProps: { id: undefined as string | undefined },
    });
    expect(api.get).not.toHaveBeenCalled();
    hook.rerender({ id: 'se1' });
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/rounds', { params: { seasonId: 'se1' } });
    expect(hook.result.current.data).toEqual([{ id: 'r1' }]);
  });

  it('kreiranje šalje tijelo i osvježava listu sezone', async () => {
    const { qc, wrapper } = setup();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    api.post.mockResolvedValue({ data: { id: 'r1' } });
    const { result } = renderHook(() => useCreateRound(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ seasonId: 'se1', number: 3, name: 'Kolo 3' });
    });
    expect(api.post).toHaveBeenCalledWith('/rounds', { seasonId: 'se1', number: 3, name: 'Kolo 3' });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['rounds', 'se1'] });
  });

  it('izmjena šalje patch bez id-a u tijelu i osvježava sezonu', async () => {
    const { qc, wrapper } = setup();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateRound(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 'r1', seasonId: 'se1', name: null as unknown as string, startsAt: null });
    });
    expect(api.patch).toHaveBeenCalledWith('/rounds/r1', { seasonId: 'se1', name: null, startsAt: null });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['rounds', 'se1'] });
  });

  it('uticaj brisanja se traži samo uz kolo', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: { matchCount: 2 } });
    const hook = renderHook(({ id }: { id: string | null }) => useRoundDeleteImpact(id), {
      wrapper, initialProps: { id: null as string | null },
    });
    expect(api.get).not.toHaveBeenCalled();
    hook.rerender({ id: 'r1' });
    await waitFor(() => expect(hook.result.current.data).toEqual({ matchCount: 2 }));
    expect(api.get).toHaveBeenCalledWith('/rounds/r1/delete-impact');
  });

  it('brisanje sa cascade šalje parametar i osvježava utakmice, tabelu i statistiku', async () => {
    const { qc, wrapper } = setup();
    const spy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteRound(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 'r1', seasonId: 'se1', cascade: true });
    });
    expect(api.delete).toHaveBeenCalledWith('/rounds/r1', { params: { cascade: 'true' } });
    expect(spy.mock.calls.map((c) => c[0])).toEqual([
      { queryKey: ['rounds', 'se1'] },
      { queryKey: ['matches'] },
      { queryKey: ['standings'] },
      { queryKey: ['statistics'] },
    ]);
  });

  it('brisanje bez cascade ne šalje parametar', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useDeleteRound(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 'r2', seasonId: 'se1' });
    });
    expect(api.delete).toHaveBeenCalledWith('/rounds/r2', { params: {} });
  });
});

describe('finansije: parametri, sažetak i izvoz', () => {
  it('prazni filteri se izostavljaju, popunjeni se šalju', () => {
    expect(financeParams(empty)).toEqual({});
    expect(financeParams(filled)).toEqual({
      from: '2026-01-01', to: '2026-02-01', provider: 'stripe', status: 'PAID',
    });
  });

  it('sažetak koristi filtere i kešira po filterima', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValue({ data: { totalSum: 120 } });
    const hook = renderHook(({ f }: { f: FinanceFilters }) => useFinanceSummary(f), {
      wrapper, initialProps: { f: empty },
    });
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/finance/summary', { params: {} });
    hook.rerender({ f: filled });
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/finance/summary', { params: financeParams(filled) }));
  });

  it('izvoz preuzima blob, pravi privremeni link i opoziva URL', async () => {
    const { wrapper } = setup();
    const create = vi.fn(() => 'blob:x');
    const revoke = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.stubGlobal('URL', { ...URL, createObjectURL: create, revokeObjectURL: revoke });
    api.get.mockResolvedValue({ data: new Blob(['x']) });
    renderHook(() => null, { wrapper });
    await downloadFinanceExport('xlsx', filled);
    expect(api.get).toHaveBeenCalledWith('/finance/export.xlsx', {
      params: financeParams(filled), responseType: 'blob',
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith('blob:x');
    click.mockRestore();
    vi.unstubAllGlobals();
  });
});
