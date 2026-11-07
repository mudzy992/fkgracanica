import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLiveStatsPopup } from './use-live-stats-popup';
import type { LiveStatItem } from '../lib/live-stats-feed';

const item = (id: string): LiveStatItem => ({
  kind: 'comparison',
  id,
  label: `Stat ${id}`,
  homeClub: 'FK Gračanica',
  awayClub: 'FK Slavija',
  home: 3,
  away: 1,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useLiveStatsPopup', () => {
  it('bez stavki ne zakazuje ništa i ostaje skriven', async () => {
    const { result } = renderHook(() => useLiveStatsPopup([]));
    await act(async () => { await vi.advanceTimersByTimeAsync(300_000); });
    expect(result.current.visible).toBe(false);
    expect(result.current.active).toBeNull();
  });

  it('sa jednom stavkom prikaže je pa je sakrije i ponovo prikaže', async () => {
    const items = [item('a')];
    const { result } = renderHook(() => useLiveStatsPopup(items));
    await act(async () => { await vi.advanceTimersByTimeAsync(45_001); });
    expect(result.current.visible).toBe(true);
    expect(result.current.active?.id).toBe('a');
    await act(async () => { await vi.advanceTimersByTimeAsync(8_001); });
    expect(result.current.visible).toBe(false);
    await act(async () => { await vi.advanceTimersByTimeAsync(120_001); });
    expect(result.current.visible).toBe(true);
    expect(result.current.active?.id).toBe('a');
  });

  it('sa više stavki izmjenjuje različite stavke', async () => {
    const items = [item('a'), item('b')];
    const { result } = renderHook(() => useLiveStatsPopup(items));
    await act(async () => { await vi.advanceTimersByTimeAsync(45_001); });
    expect(result.current.active?.id).toBe('a');
    await act(async () => { await vi.advanceTimersByTimeAsync(8_001 + 120_001); });
    expect(result.current.active?.id).toBe('b');
  });

  it('promjena liste resetuje prikaz i tajmerе', async () => {
    const { result, rerender } = renderHook(({ items }) => useLiveStatsPopup(items), {
      initialProps: { items: [item('a')] },
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(45_001); });
    expect(result.current.visible).toBe(true);
    rerender({ items: [item('c')] });
    expect(result.current.visible).toBe(false);
    expect(result.current.active).toBeNull();
  });
});
