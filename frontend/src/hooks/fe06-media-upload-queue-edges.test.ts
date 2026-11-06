import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaUploadQueueController } from './media-upload-queue-controller';

const state = vi.hoisted(() => ({ post: vi.fn(), refresh: vi.fn(), cancel: vi.fn() }));

vi.mock('../lib/api', () => ({ api: { post: (...a: unknown[]) => state.post(...a) } }));
vi.mock('./media-upload-refresh', () => ({
  refreshMediaQueries: (...a: unknown[]) => state.refresh(...a),
  cancelMediaRefresh: (...a: unknown[]) => state.cancel(...a),
}));
vi.mock('./media-upload-session', () => ({
  mediaOwnerMatches: () => true,
  MediaSessionChanged: class MediaSessionChanged extends Error {},
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const image = (name = 'slika.jpg') => new File(['x'], name, { type: 'image/jpeg' });
let client: QueryClient;

beforeEach(() => {
  state.post = vi.fn().mockResolvedValue({ data: { id: 'm1' } });
  state.refresh = vi.fn().mockResolvedValue(true);
  state.cancel = vi.fn().mockResolvedValue(undefined);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

afterEach(() => client.clear());

describe('MediaUploadQueueController — rubovi reda', () => {
  it('novi fajl tokom osvježavanja prekida zapeli GET', async () => {
    let finishRefresh!: (value: boolean) => void;
    state.refresh.mockImplementationOnce(
      () => new Promise<boolean>((resolve) => { finishRefresh = resolve; }),
    );
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image('prva.jpg')], 'f1');
    await vi.waitFor(() => expect(state.refresh).toHaveBeenCalledTimes(1));
    expect(queue.getSnapshot().isRefreshing).toBe(true);

    queue.enqueue([image('druga.jpg')], 'f1');
    expect(state.cancel).toHaveBeenCalledTimes(1);

    finishRefresh(true);
    await vi.waitFor(() => expect(state.post).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    expect(queue.getSnapshot().done).toBe(2);
  });

  it('odbijeni fajl tokom osvježavanja ne prekida GET', async () => {
    let finishRefresh!: (value: boolean) => void;
    state.refresh.mockImplementationOnce(
      () => new Promise<boolean>((resolve) => { finishRefresh = resolve; }),
    );
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image('prva.jpg')], 'f1');
    await vi.waitFor(() => expect(state.refresh).toHaveBeenCalledTimes(1));
    queue.enqueue([new File(['x'], 'dok.txt', { type: 'text/plain' })], 'f1');
    expect(state.cancel).not.toHaveBeenCalled();
    expect(queue.getSnapshot().rejectedFiles[0].reason).toBe('notImage');
    finishRefresh(true);
    await flush();
  });

  it('pad osvježavanja ostavlja greške i refreshFailed', async () => {
    state.refresh.mockRejectedValue(new Error('503'));
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image('prva.jpg')], 'f1');
    await vi.waitFor(() => expect(queue.getSnapshot().refreshFailed).toBe(true));
    const snapshot = queue.getSnapshot();
    expect(snapshot.isRunning).toBe(false);
    expect(snapshot.isRefreshing).toBe(false);
    expect(snapshot.failed).toBe(0);
    expect(snapshot.done).toBe(1);
  });

  it('pad osvježavanja sa fajlom u redu označava ga greškom', async () => {
    let finishRefresh!: (value: boolean) => void;
    state.refresh.mockRejectedValue(new Error('503'));
    const queue = new MediaUploadQueueController(client, 'u1');
    state.refresh.mockImplementationOnce(() => new Promise<boolean>((_, reject) => {
      finishRefresh = () => reject(new Error('503'));
    }));
    queue.enqueue([image('prva.jpg')], 'f1');
    await vi.waitFor(() => expect(state.refresh).toHaveBeenCalledTimes(1));
    queue.enqueue([image('druga.jpg')], 'f1');
    finishRefresh(false);
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
  });

  it('clearReport ne briše red dok je obrada u toku', async () => {
    let finishRefresh!: (value: boolean) => void;
    state.refresh.mockImplementation(
      () => new Promise<boolean>((resolve) => { finishRefresh = resolve; }),
    );
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image('prva.jpg')], 'f1');
    await vi.waitFor(() => expect(state.refresh).toHaveBeenCalledTimes(1));
    queue.clearReport();
    expect(queue.getSnapshot().total).toBe(1);
    finishRefresh(true);
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    queue.clearReport();
    expect(queue.getSnapshot()).toMatchObject({ total: 0, done: 0, failed: 0 });
  });
});
