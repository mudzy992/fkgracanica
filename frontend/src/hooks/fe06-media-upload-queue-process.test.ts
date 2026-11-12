import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaUploadQueueController } from './media-upload-queue-controller';

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

describe('MediaUploadQueueController — fajl tokom osvježavanja', () => {
  it('novi fajl tokom zapelog osvježavanja otkazuje osvježavanje', async () => {
    let finishRefresh!: (v: boolean) => void;
    let first = true;
    state.refresh = vi.fn(() => {
      if (first) {
        first = false;
        return new Promise<boolean>((resolve) => { finishRefresh = resolve; });
      }
      return Promise.resolve(true);
    });
    state.cancel.mockRejectedValueOnce(new Error('cancel pao'));
    const queue = new MediaUploadQueueController(client, 'u1');
    queue.enqueue([image('a.jpg')], 'f1');
    await vi.waitFor(() => expect(queue.getSnapshot().isRefreshing).toBe(true));
    expect(queue.getSnapshot().isRunning).toBe(true);
    queue.enqueue([image('b.jpg')], 'f1');
    expect(state.cancel).toHaveBeenCalledTimes(1);
    finishRefresh(true);
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    expect(queue.getSnapshot().total).toBe(2);
  });
});

describe('MediaUploadQueueController — izuzetak pretplatnika', () => {
  it('pad pretplatnika završava red sa izvještajem greške', async () => {
    const queue = new MediaUploadQueueController(client, 'u1');
    let calls = 0;
    queue.subscribe(() => {
      calls += 1;
      if (calls === 2) throw new Error('pretplatnik pao');
    });
    queue.enqueue([image('a.jpg')], 'f1');
    await vi.waitFor(() => expect(queue.getSnapshot().isRunning).toBe(false));
    expect(queue.getSnapshot()).toMatchObject({ failed: 1, refreshFailed: true });
    expect(queue.getSnapshot().failedFiles[0]).toMatchObject({ name: 'a.jpg', reason: 'unconfirmed' });
    expect(state.post).not.toHaveBeenCalled();
  });
});
