import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaUploadQueueController, mediaUploadQueueFor } from './media-upload-queue-controller';
import { MediaSessionChanged } from './media-upload-session';

const state = vi.hoisted(() => ({ post: vi.fn(), refresh: vi.fn(), cancel: vi.fn(), ownerMatches: true }));

vi.mock('../lib/api', () => ({ api: { post: (...a: unknown[]) => state.post(...a) } }));
vi.mock('./media-upload-refresh', () => ({
  refreshMediaQueries: (...a: unknown[]) => state.refresh(...a),
  cancelMediaRefresh: (...a: unknown[]) => state.cancel(...a),
}));
vi.mock('./media-upload-session', () => ({
  mediaOwnerMatches: () => state.ownerMatches,
  MediaSessionChanged: class MediaSessionChanged extends Error {},
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const image = (name = 'slika.jpg', type = 'image/jpeg') => new File(['x'], name, { type });

let client: QueryClient;

beforeEach(() => {
  state.post = vi.fn().mockResolvedValue({ data: { id: 'm1' } });
  state.refresh = vi.fn().mockResolvedValue(true);
  state.cancel = vi.fn().mockResolvedValue(undefined);
  state.ownerMatches = true;
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

afterEach(() => client.clear());

describe('MediaUploadQueueController — početno stanje', () => {
  it('snapshot je prazan i subscribe vraća odjavu', () => {
    const queue = new MediaUploadQueueController(client, 'u1');
    expect(queue.getSnapshot()).toEqual({
      total: 0, done: 0, failed: 0, isRunning: false, isRefreshing: false,
      refreshFailed: false, failedFiles: [], rejectedFiles: [],
    });
    const listener = vi.fn();
    const off = queue.subscribe(listener);
    off();
    queue.clearReport();
    expect(listener).not.toHaveBeenCalled();
  });

  it('prazan unos ne mijenja stanje', () => {
    const queue = new MediaUploadQueueController(client, 'u1');
    const listener = vi.fn();
    queue.subscribe(listener);
    queue.enqueue([], 'f1');
    expect(listener).not.toHaveBeenCalled();
    expect(queue.getSnapshot().total).toBe(0);
  });
});

describe('MediaUploadQueueController — odbijanja', () => {
  it('odbija ne-sliku, prazan folder i promijenjenu sesiju', () => {
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image('dok.pdf', 'application/pdf')], 'f1');
    queue.enqueue([image()], '');
    state.ownerMatches = false;
    queue.enqueue([image('x.jpg')], 'f1');
    expect(queue.getSnapshot().rejectedFiles).toEqual([
      { id: 1, name: 'dok.pdf', reason: 'notImage' },
      { id: 2, name: 'slika.jpg', reason: 'noFolder' },
      { id: 3, name: 'x.jpg', reason: 'noSession' },
    ]);
    expect(state.post).not.toHaveBeenCalled();
  });
});

describe('MediaUploadQueueController — uspješan red', () => {
  it('šalje fajlove, osvježava i završava', async () => {
    const queue = new MediaUploadQueueController(client, 'u1');
    const listener = vi.fn();
    queue.subscribe(listener);
    queue.enqueue([image('a.jpg'), image('b.jpg')], 'f1', 'Galerija');
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    const snapshot = queue.getSnapshot();
    expect(state.post).toHaveBeenCalledTimes(2);
    expect(snapshot).toMatchObject({ total: 2, done: 2, failed: 0, refreshFailed: false });
    expect(state.refresh).toHaveBeenCalledWith(client);
    expect(listener).toHaveBeenCalled();
  });

  it('postavlja formu i blokira slanje nakon promjene sesije u transformRequest', async () => {
    const queue = new MediaUploadQueueController(client, 'u1');
    let captured: { transformRequest?: Array<(d: unknown) => unknown> } = {};
    state.post.mockImplementation(async (_url, _form, config) => {
      captured = config;
      return { data: {} };
    });
    queue.enqueue([image()], 'f1');
    await vi.waitFor(() => expect(queue.getSnapshot().done).toBe(1));
    expect(captured.transformRequest?.[0]({ ok: true })).toEqual({ ok: true });
    state.ownerMatches = false;
    expect(() => captured.transformRequest?.[0]({})).toThrow();
  });

  it('greška uploada označava fajl kao nepotvrđen', async () => {
    state.post.mockRejectedValue(new Error('500'));
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image()], 'f1');
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    expect(queue.getSnapshot().failedFiles).toEqual([
      { id: 1, name: 'slika.jpg', folderId: 'f1', folderName: undefined, reason: 'unconfirmed' },
    ]);
  });

  it('promjena sesije tokom reda daje notSent', async () => {
    state.post.mockRejectedValue(new MediaSessionChanged());
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image()], 'f1', 'Galerija');
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    expect(queue.getSnapshot().failedFiles[0].reason).toBe('sessionChanged');
    expect(queue.getSnapshot().refreshFailed).toBe(false);
  });

  it('neuspjelo osvježavanje označava refreshFailed i retryRefresh ponovo pokreće', async () => {
    state.refresh.mockResolvedValue(false);
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image()], 'f1');
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    expect(queue.getSnapshot().refreshFailed).toBe(true);
    state.refresh.mockResolvedValue(true);
    queue.retryRefresh();
    await vi.waitFor(() => expect(queue.getSnapshot().refreshFailed).toBe(false));
  });

  it('retryRefresh ne radi bez greške osvježavanja', () => {
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.retryRefresh();
    expect(queue.getSnapshot().isRefreshing).toBe(false);
  });
});

describe('MediaUploadQueueController — paralelni unos i greške', () => {
  it('fajl dodan tokom osvježavanja otkazuje zapeli GET', async () => {
    let resolveRefresh: (v: boolean) => void = () => undefined;
    state.refresh.mockImplementationOnce(
      () => new Promise<boolean>((resolve) => { resolveRefresh = resolve; }),
    );
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image()], 'f1');
    await vi.waitFor(() => expect(queue.getSnapshot().isRefreshing).toBe(true));
    queue.enqueue([image('b.jpg')], 'f1');
    expect(state.cancel).toHaveBeenCalledWith(client);
    resolveRefresh(true);
    await vi.waitFor(() => expect(queue.getSnapshot().done).toBe(2));
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    expect(state.post).toHaveBeenCalledTimes(2);
  });

  it('stavka bez File objekta završava kao greška', async () => {
    let release: () => void = () => undefined;
    state.post.mockImplementationOnce(() => new Promise((resolve) => { release = () => resolve({ data: {} }); }));
    const queue = new MediaUploadQueueController(client, 'u1');
    const internals = queue as unknown as { items: Array<Record<string, unknown>> };
    queue.enqueue([image('a.jpg'), image('b.jpg')], 'f1');
    await vi.waitFor(() => expect(internals.items).toHaveLength(2));
    internals.items[1].file = null;
    release();
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    expect(queue.getSnapshot().failed).toBe(1);
    expect(queue.getSnapshot().done).toBe(2);
  });

  it('clearReport briše izvještaj samo kad red nije aktivan', async () => {
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image('dok.pdf', 'text/plain')], 'f1');
    expect(queue.getSnapshot().rejectedFiles).toHaveLength(1);
    queue.clearReport();
    expect(queue.getSnapshot().rejectedFiles).toHaveLength(0);
  });

  it('clearReport je blokiran dok red radi', () => {
    const queue = new MediaUploadQueueController(client, 'u1');
    const internals = queue as unknown as { running: boolean; items: Array<Record<string, unknown>> };
    internals.running = true;
    internals.items.push({ id: 9, name: 'x.jpg', file: null, folderId: 'f1', status: 'done' });
    queue.clearReport();
    expect(queue.getSnapshot().total).toBe(0);
  });
});

describe('mediaUploadQueueFor', () => {
  it('vraća isti kontroler za isti klijent i korisnika', () => {
    const a = mediaUploadQueueFor(client, 'u1');
    const b = mediaUploadQueueFor(client, 'u1');
    const other = mediaUploadQueueFor(client, 'u2');
    expect(a).toBe(b);
    expect(a).not.toBe(other);
    expect(mediaUploadQueueFor(new QueryClient(), 'u1')).not.toBe(a);
    expect(flush).toBeTruthy();
  });
});
