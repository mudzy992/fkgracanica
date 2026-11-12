import { describe, expect, it } from 'vitest';
import * as lazyPages from './lazy-admin-pages';

type Payload = { _status: number; _result: unknown };
type LazyComp = { _payload: Payload; _init: (payload: Payload) => unknown };

const entries = Object.entries(lazyPages) as unknown as Array<[string, LazyComp]>;

/** React 19: `_init` baci thenable dok modul nije učitan — sačekaj pa ponovi. */
async function resolveLoader(component: LazyComp): Promise<unknown> {
  try {
    return component._init(component._payload);
  } catch (thrown) {
    await thrown;
    return component._init(component._payload);
  }
}

describe('lazy-admin-pages — stvarni loaderi', () => {
  it.each(entries.map(([name]) => name))('%s učitava modul i vraća komponentu', async (name) => {
    const component = lazyPages[name as keyof typeof lazyPages] as unknown as LazyComp;
    const resolved = await resolveLoader(component);
    expect(typeof resolved).toBe('function');
    expect((resolved as { name?: string }).name).toBe(name);
  });

  it('svih osam loadera vraća različite komponente', async () => {
    const resolved = await Promise.all(entries.map(([, c]) => resolveLoader(c)));
    expect(resolved).toHaveLength(8);
    expect(new Set(resolved).size).toBe(8);
  });

  it('payload je zapečaćen na "resolved" poslije učitavanja', async () => {
    for (const [, component] of entries) {
      await resolveLoader(component);
      expect(component._payload._status).toBe(1);
    }
  });
});
