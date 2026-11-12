import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearActionError,
  getActionError,
  reportActionError,
  resetActionErrorForTests,
  runAction,
  subscribeActionError,
} from './action-errors';

/**
 * P-FE06-44: `runAction` je zamjena za 65 `void mutateAsync(...)` poziva.
 * Ranije je odbijeni zahtjev ostajao neobrađen — korisnik nije dobijao poruku.
 */
beforeEach(() => {
  resetActionErrorForTests();
});

describe('runAction — uspjeh', () => {
  it('vraća vrijednost akcije i ne prijavljuje grešku', async () => {
    await expect(runAction(Promise.resolve(42))).resolves.toEqual({ ok: true, value: 42 });
    expect(getActionError()).toBeNull();
  });

  it('uspjeh sa `undefined` se razlikuje od greške', async () => {
    await expect(runAction(Promise.resolve(undefined))).resolves.toEqual({
      ok: true,
      value: undefined,
    });
    expect(getActionError()).toBeNull();
  });

  it('prosljeđuje fallback samo kad zatreba', async () => {
    await runAction(Promise.resolve('ok'), 'poruka');
    expect(getActionError()).toBeNull();
  });
});

describe('runAction — greška', () => {
  it('hvata odbijeni zahtjev i prijavljuje poruku', async () => {
    await expect(runAction(Promise.reject(new Error('Server je pao')))).resolves.toEqual({
      ok: false,
    });
    expect(getActionError()).toMatchObject({ kind: 'message', message: 'Server je pao' });
  });

  it('koristi prevedenu opštu poruku kad API ne da razlog', async () => {
    await runAction(Promise.reject({}));
    expect(getActionError()).toMatchObject({ kind: 'key', key: 'common.actionFailed' });
  });

  it('koristi proslijeđeni fallback umjesto opšte poruke', async () => {
    await runAction(Promise.reject({}), 'admin.common.error');
    expect(getActionError()).toMatchObject({ kind: 'key', key: 'admin.common.error' });
  });

  it('ne baca dalje — nema neobrađenog rejectiona', async () => {
    let unhandled = false;
    const onUnhandled = () => {
      unhandled = true;
    };
    process.once('unhandledRejection', onUnhandled);
    await runAction(Promise.reject(new Error('x')));
    await new Promise((resolve) => setTimeout(resolve, 0));
    process.off('unhandledRejection', onUnhandled);
    expect(unhandled).toBe(false);
  });

  it('svaka nova greška dobija novi id', async () => {
    await runAction(Promise.reject(new Error('prva')));
    const first = getActionError();
    await runAction(Promise.reject(new Error('druga')));
    const second = getActionError();
    expect(second?.id).toBe((first?.id ?? 0) + 1);
    expect(second).toMatchObject({ kind: 'message', message: 'druga' });
  });
});

describe('store', () => {
  it('obavještava pretplatnike i odjavljuje ih', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeActionError(listener);
    reportActionError(new Error('greška'));
    expect(listener).toHaveBeenCalledTimes(1);
    clearActionError();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    reportActionError(new Error('poslije odjave'));
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('clear je bezopasan kad nema greške', () => {
    clearActionError();
    expect(getActionError()).toBeNull();
  });

  it('reset vraća stanje na početak', () => {
    reportActionError(new Error('x'));
    resetActionErrorForTests();
    expect(getActionError()).toBeNull();
  });
});
