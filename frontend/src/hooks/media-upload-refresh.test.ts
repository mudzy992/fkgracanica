import { QueryClient, QueryObserver, onlineManager } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshMediaQueries } from './media-upload-refresh';

afterEach(() => { onlineManager.setOnline(true); vi.useRealTimers(); });

describe('provjera osvježavanja medija', () => {
  it('vremenski ograničava zaglavljeni GET i otkazuje samo čitanja medija', async () => {
    vi.useFakeTimers();
    const client = new QueryClient();
    vi.spyOn(client, 'invalidateQueries').mockImplementation(() => new Promise(() => {}));
    const cancel = vi.spyOn(client, 'cancelQueries').mockResolvedValue();
    const result = refreshMediaQueries(client);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await result).toBe(false);
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(cancel).toHaveBeenCalledWith({ queryKey: ['media', 'assets'] });
    expect(cancel).toHaveBeenCalledWith({ queryKey: ['media', 'folders'] });
    expect(vi.getTimerCount()).toBe(0);
    client.clear();
  });

  it('bez aktivnih upita ne tvrdi da je osvježavanje potvrđeno', async () => {
    const client = new QueryClient();
    expect(await refreshMediaQueries(client)).toBe(false);
    client.clear();
  });

  it('offline-paused upit nije uspješna provjera', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const assetKey = ['media', 'assets'];
    const folderKey = ['media', 'folders'];
    client.setQueryData(assetKey, []);
    client.setQueryData(folderKey, []);
    const options = { queryFn: async () => [], staleTime: Infinity };
    const a = new QueryObserver(client, { ...options, queryKey: assetKey });
    const f = new QueryObserver(client, { ...options, queryKey: folderKey });
    const offA = a.subscribe(() => {});
    const offF = f.subscribe(() => {});
    onlineManager.setOnline(false);
    expect(await refreshMediaQueries(client)).toBe(false);
    expect(client.getQueryState(assetKey)?.fetchStatus).toBe('paused');
    offA(); offF(); client.clear();
  });

  it('odbijeni upit ne potvrđuje osvježavanje', async () => {
    const client = new QueryClient();
    vi.spyOn(client, 'invalidateQueries').mockRejectedValue(new Error('x'));
    expect(await refreshMediaQueries(client)).toBe(false);
    client.clear();
  });

  it('greška pri pozivu osvježavanja vraća false', async () => {
    const client = new QueryClient();
    vi.spyOn(client, 'invalidateQueries').mockImplementation(() => {
      throw new Error('x');
    });
    expect(await refreshMediaQueries(client)).toBe(false);
    client.clear();
  });
});
