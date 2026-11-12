import { describe, expect, it, vi } from 'vitest';
import { confirmPaymentOnce } from './payment-confirm-once';

describe('confirmPaymentOnce', () => {
  it('dijeli samo istovremene pozive istog ključa i ne miješa različite korisnike/sesije', async () => {
    let resolve!: (value: string) => void;
    const request = new Promise<string>((done) => { resolve = done; });
    const first = vi.fn(() => request);
    const other = vi.fn().mockResolvedValue('other');
    const a = confirmPaymentOnce('user-1/session', first);
    const b = confirmPaymentOnce('user-1/session', first);
    const c = confirmPaymentOnce('user-2/session', other);
    expect(first).toHaveBeenCalledTimes(1);
    expect(other).toHaveBeenCalledTimes(1);
    resolve('paid');
    expect(await Promise.all([a, b, c])).toEqual(['paid', 'paid', 'other']);
    await confirmPaymentOnce('user-1/session', first);
    expect(first).toHaveBeenCalledTimes(2);
  });

  it('sync i async greške uklanjaju zaključavanje i omogućavaju novi pokušaj', async () => {
    const sync = vi.fn((): Promise<string> => { throw new Error('sync'); });
    await expect(confirmPaymentOnce('bad-sync', sync)).rejects.toThrow('sync');
    await expect(confirmPaymentOnce('bad-sync', () => Promise.resolve('ok'))).resolves.toBe('ok');
    await expect(confirmPaymentOnce('bad-async', () => Promise.reject(new Error('503')))).rejects.toThrow('503');
    await expect(confirmPaymentOnce('bad-async', () => Promise.resolve('ok'))).resolves.toBe('ok');
  });
});
