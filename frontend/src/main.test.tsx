import { describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ bootstrap: vi.fn() }));

vi.mock('./bootstrap', () => ({ bootstrap: state.bootstrap }));

describe('main', () => {
  it('pokreće bootstrap tačno jednom pri učitavanju', async () => {
    await import('./main');
    expect(state.bootstrap).toHaveBeenCalledTimes(1);
  });
});
