import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMediaUploadQueue } from './use-media-upload-queue';

const api = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../lib/api', () => ({ api }));
const image = (name: string) => new File([name], name, { type: 'image/jpeg' });
const cleanup: (() => void)[] = [];
function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const assetKey = ['media', 'assets', 'test'];
  const folderKey = ['media', 'folders'];
  const assets = vi.fn().mockResolvedValue({ data: [] });
  const folders = vi.fn().mockResolvedValue([]);
  qc.setQueryData(assetKey, { data: [] });
  qc.setQueryData(folderKey, []);
  const assetObserver = new QueryObserver(qc, { queryKey: assetKey, queryFn: assets, staleTime: Infinity });
  const folderObserver = new QueryObserver(qc, { queryKey: folderKey, queryFn: folders, staleTime: Infinity });
  const offAssets = assetObserver.subscribe(() => {});
  const offFolders = folderObserver.subscribe(() => {});
  cleanup.push(() => { offAssets(); offFolders(); qc.clear(); });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper, assets, folders, assetKey };
}
beforeEach(() => { api.post.mockReset(); localStorage.setItem('fk_user', JSON.stringify({ id: 'test-user' })); localStorage.setItem('fk_access_token', 'test-token'); });
afterEach(() => { cleanup.splice(0).forEach((dispose) => dispose()); localStorage.clear(); vi.useRealTimers(); });

describe('red medijskih uploada', () => {
  it('zadržava dodatni izbor dok je prvi POST u toku i pamti mapu svakog izbora', async () => {
    const { wrapper, assets, folders } = setup();
    let finishFirst!: () => void;
    api.post.mockImplementationOnce(() => new Promise((resolve) => { finishFirst = () => resolve({ data: {} }); }))
      .mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useMediaUploadQueue('test-user'), { wrapper });
    act(() => { result.current.enqueue([image('first.jpg')], 'folder-a'); });
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    act(() => { result.current.enqueue([image('second.jpg')], 'folder-b'); });
    expect(result.current.state.total).toBe(2);
    expect(api.post).toHaveBeenCalledTimes(1);
    await act(async () => { finishFirst(); });
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
    const first = api.post.mock.calls[0][1] as FormData;
    const second = api.post.mock.calls[1][1] as FormData;
    expect((first.get('file') as File).name).toBe('first.jpg');
    expect(first.get('folderId')).toBe('folder-a');
    expect((second.get('file') as File).name).toBe('second.jpg');
    expect(second.get('folderId')).toBe('folder-b');
    expect(api.post.mock.calls[0][2]).toMatchObject({ _retry: true });
    await waitFor(() => expect(result.current.state).toMatchObject({ total: 2, done: 2, failed: 0, isRunning: false, refreshFailed: false }));
    expect(assets).toHaveBeenCalledTimes(1);
    expect(folders).toHaveBeenCalledTimes(1);
  });

  it('novi izbor tokom odgođene invalidacije nastavlja red bez čekanja starog GET-a', async () => {
    const { qc, wrapper, assets, assetKey } = setup();
    let finishOld!: () => void;
    assets.mockImplementationOnce(() => new Promise((resolve) => { finishOld = () => resolve({ data: ['old'] }); }))
      .mockResolvedValue({ data: ['new'] });
    api.post.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useMediaUploadQueue('test-user'), { wrapper });
    act(() => { result.current.enqueue([image('first.jpg')], 'a'); });
    await waitFor(() => expect(result.current.state.isRefreshing).toBe(true));
    expect(api.post).toHaveBeenCalledTimes(1);
    act(() => { result.current.enqueue([image('second.jpg')], 'b'); });
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.state).toMatchObject({ total: 2, done: 2, isRunning: false, refreshFailed: false }));
    finishOld();
    await Promise.resolve();
    expect(qc.getQueryData(assetKey)).toEqual({ data: ['new'] });
  });

  it('greška pojedinačnog POST-a ostaje vidljiva i ostale fajlove nastavlja bez automatskog retryja', async () => {
    const { wrapper } = setup();
    api.post.mockRejectedValueOnce(new Error('unknown outcome')).mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useMediaUploadQueue('test-user'), { wrapper });
    act(() => { result.current.enqueue([image('bad.jpg'), image('good.jpg')], 'f', 'Klub'); });
    await waitFor(() => expect(result.current.state).toMatchObject({ total: 2, done: 2, failed: 1, isRunning: false }));
    expect(api.post).toHaveBeenCalledTimes(2);
    expect(result.current.state.failedFiles).toEqual([{ id: 1, name: 'bad.jpg', folderId: 'f', folderName: 'Klub', reason: 'unconfirmed' }]);
    expect(result.current.state.refreshFailed).toBe(false);
  });

  it('ne-slike i izbor bez mape javno odbija bez POST-a, a valjane slike zadržava', async () => {
    const { wrapper } = setup();
    api.post.mockResolvedValue({ data: {} });
    const text = new File(['x'], 'notes.txt', { type: 'text/plain' });
    const { result } = renderHook(() => useMediaUploadQueue('test-user'), { wrapper });
    act(() => { result.current.enqueue([text, image('valid.jpg')], 'f'); });
    act(() => { result.current.enqueue([image('no-folder.jpg')], ''); });
    await waitFor(() => expect(result.current.state).toMatchObject({ total: 1, done: 1, isRunning: false }));
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(result.current.state.rejectedFiles).toEqual([
      { id: 1, name: 'notes.txt', reason: 'notImage' },
      { id: 3, name: 'no-folder.jpg', reason: 'noFolder' },
    ]);
  });

  it('neuspjeh osvježavanja prikazuje i ručni retry radi samo GET-ove', async () => {
    const { wrapper, assets } = setup();
    assets.mockRejectedValueOnce(new Error('503')).mockResolvedValue({ data: ['fresh'] });
    api.post.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useMediaUploadQueue('test-user'), { wrapper });
    act(() => { result.current.enqueue([image('a.jpg')], 'f'); });
    await waitFor(() => expect(result.current.state).toMatchObject({ done: 1, isRunning: false, refreshFailed: true }));
    act(() => { result.current.retryRefresh(); });
    await waitFor(() => expect(result.current.state).toMatchObject({ done: 1, isRunning: false, refreshFailed: false }));
    expect(assets).toHaveBeenCalledTimes(2);
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('SPA remount zadržava aktivni red, mape i rezultat bez drugog workera', async () => {
    const { wrapper } = setup();
    let finishFirst!: () => void;
    api.post.mockImplementationOnce(() => new Promise((resolve) => { finishFirst = () => resolve({ data: {} }); }))
      .mockResolvedValue({ data: {} });
    const first = renderHook(() => useMediaUploadQueue('test-user'), { wrapper });
    act(() => { first.result.current.enqueue([image('a.jpg')], 'a'); });
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    first.unmount();
    const second = renderHook(() => useMediaUploadQueue('test-user'), { wrapper });
    expect(second.result.current.state).toMatchObject({ total: 1, done: 0, isRunning: true });
    act(() => { second.result.current.enqueue([image('b.jpg')], 'b'); });
    await act(async () => { finishFirst(); });
    await waitFor(() => expect(second.result.current.state).toMatchObject({ total: 2, done: 2, isRunning: false }));
    expect(api.post).toHaveBeenCalledTimes(2);
  });

  it('izvještaj ostaje dok se ručno ne zatvori; nije moguće očistiti aktivni red', async () => {
    const { wrapper } = setup();
    let finish!: () => void;
    api.post.mockImplementationOnce(() => new Promise((resolve) => { finish = () => resolve({ data: {} }); }));
    const { result } = renderHook(() => useMediaUploadQueue('test-user'), { wrapper });
    act(() => { result.current.enqueue([image('a.jpg')], 'f'); result.current.clearReport(); });
    expect(result.current.state).toMatchObject({ total: 1, isRunning: true });
    await act(async () => { finish(); });
    await waitFor(() => expect(result.current.state).toMatchObject({ total: 1, done: 1, isRunning: false }));
    vi.useFakeTimers();
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(result.current.state).toMatchObject({ total: 1, done: 1 });
    act(() => { result.current.clearReport(); });
    expect(result.current.state).toMatchObject({ total: 0, done: 0, failed: 0, refreshFailed: false });
  });

  it('promjena korisnika ne prenosi red ni izvještaj i ne šalje preostale fajlove', async () => {
    const { wrapper } = setup();
    let finishFirst!: () => void;
    api.post.mockImplementationOnce(() => new Promise((resolve) => { finishFirst = () => resolve({ data: {} }); }));
    const first = renderHook(() => useMediaUploadQueue('test-user'), { wrapper });
    act(() => { first.result.current.enqueue([image('a.jpg'), image('b.jpg')], 'f'); });
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    localStorage.setItem('fk_user', JSON.stringify({ id: 'other-user' }));
    localStorage.setItem('fk_access_token', 'other-token');
    const transform = api.post.mock.calls[0][2].transformRequest[0] as (body: FormData) => FormData;
    expect(() => transform(new FormData())).toThrow('Media upload session changed');
    await act(async () => { finishFirst(); });
    await waitFor(() => expect(first.result.current.state).toMatchObject({ total: 2, done: 2, failed: 1, isRunning: false }));
    expect(first.result.current.state.failedFiles[0]).toMatchObject({ name: 'b.jpg', reason: 'sessionChanged' });
    expect(api.post).toHaveBeenCalledTimes(1);
    const second = renderHook(() => useMediaUploadQueue('other-user'), { wrapper });
    expect(second.result.current.state).toMatchObject({ total: 0, failed: 0, isRunning: false });
  });

});
