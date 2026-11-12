import type { QueryClient } from '@tanstack/react-query';

const keys = [['media', 'assets'], ['media', 'folders']] as const;
const timeoutMs = 15_000;

export async function cancelMediaRefresh(client: QueryClient) {
  await Promise.all(keys.map((queryKey) => client.cancelQueries({ queryKey })));
}

/** Ograničen pokušaj osvježavanja bez POST-a; neaktivan/paused query nije potvrda. */
export async function refreshMediaQueries(client: QueryClient): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // Bez throwOnError: paused query može ostati aktivan i kasnije odbiti promise.
    // Uspjeh se provjerava preko stvarnog stanja aktivnih upita ispod.
    const work = Promise.allSettled(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
    const timeout = new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs); });
    const result = await Promise.race([work, timeout]);
    if (!result) {
      await cancelMediaRefresh(client);
      return false;
    }
    if (result.some((item) => item.status === 'rejected')) return false;
    return keys.every((queryKey) => {
      const active = client.getQueryCache().findAll({ queryKey, type: 'active' });
      return active.length > 0 && active.every((query) =>
        query.state.status === 'success' && query.state.fetchStatus === 'idle' && !query.state.isInvalidated);
    });
  } catch {
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
