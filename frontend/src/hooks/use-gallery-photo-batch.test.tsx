import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGalleryPhotoBatch } from './use-gallery-photo-batch';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));

const gallery = (paths: string[] = []) => ({
  id: 'g', title: 'Album', status: 'DRAFT',
  photos: paths.map((path, index) => ({ id: `p${index}`, path })),
});
function setup(paths: string[] = []) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  qc.setQueryData(['gallery', 'g'], gallery(paths));
  qc.setQueryData(['gallery', 'admin'], ['previous list']);
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}
const add = (result: { current: ReturnType<typeof useGalleryPhotoBatch> }, paths: string[]) =>
  act(async () => { await result.current.add({ paths }); });
beforeEach(() => { Object.values(api).forEach((mock) => mock.mockReset()); });

describe('dodavanje fotografija i provjera stanja galerije', () => {
  it('preskače postojeće i ponovljene putanje te eksplicitno osvježava detalj nakon uspjeha', async () => {
    const { qc, wrapper } = setup(['a']);
    api.post.mockResolvedValue({ data: {} });
    api.get.mockResolvedValue({ data: gallery(['a', 'b']) });
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await add(result, ['a', 'b', 'b', '']);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/gallery/g/photos', { path: 'b' }, { timeout: 30_000 });
    expect(api.get).toHaveBeenCalledWith('/gallery/g', { timeout: 15_000, headers: { 'Cache-Control': 'no-cache' } });
    expect(qc.getQueryData(['gallery', 'g'])).toEqual(gallery(['a', 'b']));
    expect(qc.getQueryState(['gallery', 'admin'])?.isInvalidated).toBe(true);
    await waitFor(() => expect(result.current.state).toEqual({ phase: 'ready', notice: null }));
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('prekida niz na grešci, osvježava djelimičan upis i ponovno šalje samo nedostajuće', async () => {
    const { qc, wrapper } = setup();
    const paths: string[] = [];
    let fail = true;
    api.post.mockImplementation(async (_url: string, body: { path: string }) => {
      if (body.path === 'b' && fail) { fail = false; throw new Error('500'); }
      paths.push(body.path); return { data: {} };
    });
    api.get.mockImplementation(async () => ({ data: gallery([...paths]) }));
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await add(result, ['a', 'b', 'c']);
    await waitFor(() => expect(result.current.state).toEqual({ phase: 'ready', notice: 'partial' }));
    expect(paths).toEqual(['a']);
    expect(api.post).toHaveBeenCalledTimes(2);
    expect(qc.getQueryState(['gallery', 'admin'])?.isInvalidated).toBe(true);
    await add(result, ['a', 'b', 'c']);
    expect(paths).toEqual(['a', 'b', 'c']);
    expect(api.post.mock.calls.map(([, body]) => body.path)).toEqual(['a', 'b', 'b', 'c']);
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('neizvjestan odgovor nakon mock upisa ne ponavlja putanju koju GET već prikazuje', async () => {
    const { wrapper } = setup();
    const paths: string[] = [];
    api.post.mockImplementation(async (_url: string, body: { path: string }) => {
      paths.push(body.path); throw new Error('timeout after commit');
    });
    api.get.mockImplementation(async () => ({ data: gallery([...paths]) }));
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await add(result, ['a']);
    await waitFor(() => expect(result.current.state.notice).toBe('partial'));
    await add(result, ['a']);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(paths).toEqual(['a']);
  });

  it('neuspjela provjera ostaje blokirana, retry je samo GET i novi POST traži ručni izbor', async () => {
    const { wrapper } = setup();
    api.post.mockRejectedValue(new Error('unknown outcome'));
    api.get.mockRejectedValueOnce(new Error('offline')).mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ data: gallery(['a']) });
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await add(result, ['a']);
    await waitFor(() => expect(result.current.state).toEqual({ phase: 'blocked', notice: 'partialUnverified' }));
    await add(result, ['b']);
    expect(api.post).toHaveBeenCalledTimes(1);
    await act(async () => { await result.current.retryRefresh(); });
    expect(result.current.state.phase).toBe('blocked');
    expect(api.post).toHaveBeenCalledTimes(1);
    await act(async () => { await result.current.retryRefresh(); });
    await waitFor(() => expect(result.current.state).toEqual({ phase: 'ready', notice: 'partial' }));
    expect(api.post).toHaveBeenCalledTimes(1);
    api.post.mockResolvedValueOnce({ data: {} });
    api.get.mockResolvedValueOnce({ data: gallery(['a', 'b']) });
    await add(result, ['a', 'b']);
    expect(api.post).toHaveBeenCalledTimes(2);
    expect(api.post.mock.calls[1][1]).toEqual({ path: 'b' });
  });

  it('i nakon potpunog uspjeha blokira dodavanje ako je potvrda pala', async () => {
    const { wrapper } = setup();
    api.post.mockResolvedValue({ data: {} });
    api.get.mockRejectedValueOnce(new Error('503')).mockResolvedValueOnce({ data: gallery(['a']) });
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await add(result, ['a']);
    await waitFor(() => expect(result.current.state).toEqual({ phase: 'blocked', notice: 'savedUnverified' }));
    await act(async () => { await result.current.retryRefresh(); });
    await waitFor(() => expect(result.current.state).toEqual({ phase: 'ready', notice: 'refreshed' }));
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('čita sve stranice mape i uklanja duplikate prije POST-a', async () => {
    const { wrapper } = setup(['a']);
    api.get.mockImplementation(async (url: string, options?: { params?: { page?: number } }) => {
      if (url === '/gallery/g') return { data: gallery(['a', 'b']) };
      return { data: { data: options?.params?.page === 1 ? [{ originalPath: 'a' }, { originalPath: 'b' }] : [{ originalPath: 'b' }], meta: { totalPages: 2 } } };
    });
    api.post.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await act(async () => { await result.current.add({ folderId: 'folder' }); });
    expect(api.get.mock.calls.filter(([url]) => url === '/media/assets')).toHaveLength(2);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post.mock.calls[0][1]).toEqual({ path: 'b' });
  });

  it('ne šalje ništa ako učitavanje mape pukne na narednoj stranici', async () => {
    const { wrapper } = setup();
    api.get.mockResolvedValueOnce({ data: { data: [{ originalPath: 'a' }], meta: { totalPages: 2 } } })
      .mockRejectedValueOnce(new Error('503'));
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await act(async () => { await result.current.add({ folderId: 'folder' }); });
    await waitFor(() => expect(result.current.state).toEqual({ phase: 'ready', notice: 'folderFailed' }));
    expect(api.post).not.toHaveBeenCalled();
  });

  it('neispravan ili nedostupan detalj ne smatra potvrdom i ne šalje POST', async () => {
    const { qc, wrapper } = setup();
    qc.removeQueries({ queryKey: ['gallery', 'g'] });
    api.get.mockResolvedValueOnce({ data: { id: 'g', title: 'Album' } })
      .mockResolvedValueOnce({ data: gallery([]) });
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await add(result, ['a']);
    await waitFor(() => expect(result.current.state).toEqual({ phase: 'blocked', notice: 'initialUnverified' }));
    expect(api.post).not.toHaveBeenCalled();
    await act(async () => { await result.current.retryRefresh(); });
    await waitFor(() => expect(result.current.state.phase).toBe('ready'));
    expect(api.post).not.toHaveBeenCalled();
  });

  it('blokada i pending operacija opstaju pri ponovnom montiranju; dupli pozivi ne šalju POST', async () => {
    const { wrapper } = setup();
    let rejectPost!: (reason: Error) => void;
    api.post.mockImplementation(() => new Promise((_resolve, reject) => { rejectPost = reject; }));
    api.get.mockRejectedValue(new Error('503'));
    const first = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    let running!: Promise<void>;
    act(() => { running = first.result.current.add({ paths: ['a'] }); });
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    first.unmount();
    const second = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await waitFor(() => expect(second.result.current.state.phase).toBe('adding'));
    await add(second.result, ['a']);
    expect(api.post).toHaveBeenCalledTimes(1);
    await act(async () => { rejectPost(new Error('timeout')); await running; });
    await waitFor(() => expect(second.result.current.state.phase).toBe('blocked'));
    second.unmount();
    const third = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    expect(third.result.current.state).toEqual({ phase: 'blocked', notice: 'partialUnverified' });
    await add(third.result, ['a']);
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('stariji započeti query ne može prepisati noviji provjereni detalj', async () => {
    const { qc, wrapper } = setup();
    let completeStale!: (value: ReturnType<typeof gallery>) => void;
    const stale = qc.fetchQuery({
      queryKey: ['gallery', 'g'], staleTime: 0,
      queryFn: () => new Promise<ReturnType<typeof gallery>>((resolve) => { completeStale = resolve; }),
    }).catch(() => undefined);
    api.post.mockResolvedValue({ data: {} });
    api.get.mockResolvedValue({ data: gallery(['a']) });
    const { result } = renderHook(() => useGalleryPhotoBatch('g'), { wrapper });
    await add(result, ['a']);
    completeStale(gallery([]));
    await stale;
    await Promise.resolve();
    expect(qc.getQueryData(['gallery', 'g'])).toEqual(gallery(['a']));
  });

});
