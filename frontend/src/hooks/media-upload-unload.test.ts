import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaUploadQueueController } from './media-upload-queue-controller';
import { createMediaUploadUnloadGuard } from './media-upload-unload';

const mocks = vi.hoisted(() => ({
  post: vi.fn(), refresh: vi.fn(), cancel: vi.fn(),
}));
vi.mock('../lib/api', () => ({ api: { post: mocks.post } }));
vi.mock('./media-upload-refresh', () => ({
  refreshMediaQueries: mocks.refresh, cancelMediaRefresh: mocks.cancel,
}));

const controllers: MediaUploadQueueController[] = [];
const releases: (() => void)[] = [];
const image = (name: string) => new File([name], name, { type: 'image/jpeg' });
function hold<T>(value: T) {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  const release = () => resolve(value);
  releases.push(release);
  return { promise, release };
}
function controller(owner = 'test-user') {
  const queue = new MediaUploadQueueController(new QueryClient(), owner);
  controllers.push(queue);
  return queue;
}
function beforeUnloadWasPrevented() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

beforeEach(() => {
  mocks.post.mockReset();
  mocks.refresh.mockReset().mockResolvedValue(true);
  mocks.cancel.mockReset().mockResolvedValue(undefined);
  localStorage.setItem('fk_user', JSON.stringify({ id: 'test-user' }));
  localStorage.setItem('fk_access_token', 'test-token');
});
afterEach(async () => {
  releases.splice(0).forEach((release) => release());
  await waitFor(() => controllers.forEach((queue) => expect(queue.getSnapshot().isRunning).toBe(false)));
  controllers.length = 0;
  localStorage.clear();
});

describe('upozorenje za medijski red prije napuštanja taba', () => {
  it('prati aktivne i neposlane slike, ali ne čeka završni GET niti zatvaranje izvještaja', async () => {
    const first = hold({ data: {} });
    const second = hold({ data: {} });
    const refresh = hold(true);
    mocks.post.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    mocks.refresh.mockReturnValue(refresh.promise);
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const queue = controller();
    expect(beforeUnloadWasPrevented()).toBe(false);
    queue.enqueue([image('first.jpg'), image('second.jpg')], 'folder');
    expect(beforeUnloadWasPrevented()).toBe(true);
    expect(mocks.post).toHaveBeenCalledTimes(1);
    first.release();
    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(2));
    expect(beforeUnloadWasPrevented()).toBe(true);
    second.release();
    await waitFor(() => expect(queue.getSnapshot().isRefreshing).toBe(true));
    expect(beforeUnloadWasPrevented()).toBe(false);
    refresh.release();
    await waitFor(() => expect(queue.getSnapshot()).toMatchObject({ total: 2, done: 2, isRunning: false }));
    expect(beforeUnloadWasPrevented()).toBe(false);
    expect(add.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(1);
    expect(remove.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(1);
  });

  it('novi izbor tokom osvježavanja ponovo uključuje upozorenje', async () => {
    const first = hold({ data: {} });
    const second = hold({ data: {} });
    const refresh = hold(true);
    mocks.post.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    mocks.refresh.mockReturnValueOnce(refresh.promise).mockResolvedValue(true);
    const queue = controller();
    queue.enqueue([image('first.jpg')], 'folder');
    expect(beforeUnloadWasPrevented()).toBe(true);
    first.release();
    await waitFor(() => expect(queue.getSnapshot().isRefreshing).toBe(true));
    expect(beforeUnloadWasPrevented()).toBe(false);
    queue.enqueue([image('second.jpg')], 'folder');
    expect(beforeUnloadWasPrevented()).toBe(true);
    expect(mocks.cancel).toHaveBeenCalledTimes(1);
    refresh.release();
    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(2));
    expect(beforeUnloadWasPrevented()).toBe(true);
    second.release();
    await waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    expect(beforeUnloadWasPrevented()).toBe(false);
  });

  it('ne upozorava samo zbog odbijenog odabira ili neusaglašene mape', () => {
    const queue = controller();
    queue.enqueue([new File(['x'], 'notes.txt', { type: 'text/plain' })], 'folder');
    queue.enqueue([image('no-folder.jpg')], '');
    expect(beforeUnloadWasPrevented()).toBe(false);
    expect(mocks.post).not.toHaveBeenCalled();
    expect(queue.getSnapshot().rejectedFiles).toHaveLength(2);
  });

  it('upozorenje ostaje i bez UI pretplatnika, a greška ne ponavlja POST', async () => {
    const current = hold({ data: {} });
    mocks.post.mockRejectedValueOnce(new Error('unknown outcome')).mockReturnValueOnce(current.promise);
    const queue = controller();
    const unsubscribe = queue.subscribe(() => {});
    queue.enqueue([image('failed.jpg'), image('next.jpg')], 'folder');
    unsubscribe();
    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(2));
    expect(beforeUnloadWasPrevented()).toBe(true);
    current.release();
    await waitFor(() => expect(queue.getSnapshot()).toMatchObject({ done: 2, failed: 1, isRunning: false }));
    expect(beforeUnloadWasPrevented()).toBe(false);
    expect(mocks.post).toHaveBeenCalledTimes(2);
  });

  it('gašenje upozorenja reda ne uklanja zaštitu neke druge nespremljene forme', async () => {
    const other = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', other);
    try {
      const upload = hold({ data: {} });
      mocks.post.mockReturnValueOnce(upload.promise);
      const queue = controller();
      queue.enqueue([image('one.jpg')], 'folder');
      expect(beforeUnloadWasPrevented()).toBe(true);
      upload.release();
      await waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
      expect(beforeUnloadWasPrevented()).toBe(true);
    } finally {
      window.removeEventListener('beforeunload', other);
    }
    expect(beforeUnloadWasPrevented()).toBe(false);
  });

  it('sigurno radi i bez window objekta te se kasnije može aktivirati', () => {
    const guard = createMediaUploadUnloadGuard();
    vi.stubGlobal('window', undefined);
    try { expect(() => guard(true)).not.toThrow(); }
    finally { vi.unstubAllGlobals(); }
    guard(true);
    expect(beforeUnloadWasPrevented()).toBe(true);
    guard(false);
    expect(beforeUnloadWasPrevented()).toBe(false);
  });

  it('odvojeni redovi ne uklanjaju međusobno upozorenje', async () => {
    const first = hold({ data: {} });
    const second = hold({ data: {} });
    mocks.post.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const one = controller('test-user');
    one.enqueue([image('one.jpg')], 'folder');
    localStorage.setItem('fk_user', JSON.stringify({ id: 'other-user' }));
    const two = controller('other-user');
    two.enqueue([image('two.jpg')], 'folder');
    expect(beforeUnloadWasPrevented()).toBe(true);
    first.release();
    await waitFor(() => expect(one.getSnapshot().isRunning).toBe(false));
    expect(beforeUnloadWasPrevented()).toBe(true);
    second.release();
    await waitFor(() => expect(two.getSnapshot().isRunning).toBe(false));
    expect(beforeUnloadWasPrevented()).toBe(false);
  });
});
