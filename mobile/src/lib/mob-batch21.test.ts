import { beforeEach, describe, expect, it, vi } from 'vitest';

(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;

vi.mock('react-native', () => ({
  Vibration: { vibrate: vi.fn() },
  Platform: { OS: 'ios' as const },
  Linking: { openURL: vi.fn(async () => {}) },
  Alert: { alert: vi.fn() },
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

vi.mock('./api', () => ({
  API_URL: 'https://api.fkgracanica.ba101.top/api/v1',
  api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) },
}));

import { Alert, Linking, Platform } from 'react-native';
import { createLiveActionRunner } from '../components/staff/commentator-api';
import { openMaps } from './open-maps';
import { computeLiveClock, formatLiveMinute } from './live-clock';
import { getApiErrorMessage } from './api-error';

describe('mob-batch21 — P-MOB21 live/maps/clock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Platform as unknown as { OS: string }).OS = 'ios';
    vi.mocked(Linking.openURL).mockResolvedValue(undefined as never);
    vi.mocked(Alert.alert).mockClear();
  });

  it('createLiveActionRunner ne zove Alert kad uspije', async () => {
    const runner = createLiveActionRunner('fallback');
    await runner(async () => 'ok');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('createLiveActionRunner zove Alert sa porukom kad baci', async () => {
    const runner = createLiveActionRunner('Greška');
    const err = { isAxiosError: true, response: { data: { message: 'API greška' } } } as never;
    await runner(async () => { throw err; });
    expect(Alert.alert).toHaveBeenCalledWith('Greška', 'API greška');
  });

  it('createLiveActionRunner fallback kad nema axios poruke', async () => {
    const runner = createLiveActionRunner('fallback');
    await runner(async () => { throw new Error('boom'); });
    expect(Alert.alert).toHaveBeenCalledWith('fallback', 'boom');
    vi.mocked(Alert.alert).mockClear();
    await runner(async () => { throw null; });
    expect(Alert.alert).toHaveBeenCalledWith('fallback', 'fallback');
  });

  it('openMaps prazan query early return', async () => {
    await openMaps('   ');
    expect(Linking.openURL).not.toHaveBeenCalled();
    await openMaps('');
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('openMaps iOS koristi maps: pa apple', async () => {
    (Platform as unknown as { OS: string }).OS = 'ios';
    vi.mocked(Linking.openURL).mockResolvedValueOnce(undefined as never);
    await openMaps('Stadion Luke');
    expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('maps:0,0?q='));
    vi.clearAllMocks();
    vi.mocked(Linking.openURL).mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined as never);
    await openMaps('Stadion');
    expect(Linking.openURL).toHaveBeenCalledTimes(2);
    expect(Linking.openURL).toHaveBeenLastCalledWith(expect.stringContaining('maps.apple.com'));
  });

  it('openMaps android koristi geo: pa google', async () => {
    (Platform as unknown as { OS: string }).OS = 'android';
    vi.mocked(Linking.openURL).mockResolvedValueOnce(undefined as never);
    await openMaps('Adresa 123');
    expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('geo:0,0?q='));
    vi.clearAllMocks();
    vi.mocked(Linking.openURL).mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined as never);
    await openMaps('Adresa');
    expect(Linking.openURL).toHaveBeenLastCalledWith(expect.stringContaining('maps.google.com'));
  });

  it('openMaps ignoriše greške kad oba padnu', async () => {
    (Platform as unknown as { OS: string }).OS = 'ios';
    vi.mocked(Linking.openURL).mockRejectedValue(new Error('fail') as never);
    await expect(openMaps('X')).resolves.toBeUndefined();
    expect(Linking.openURL).toHaveBeenCalledTimes(2);
  });

  it('computeLiveClock SECOND_HALF displayMinute', () => {
    const now = Date.now();
    const startedAt = new Date(now - 65 * 1000).toISOString();
    const res = computeLiveClock({ status: 'LIVE', clockStartedAt: startedAt, matchPeriod: 'SECOND_HALF' });
    expect(res).not.toBeNull();
    expect(res!.periodLabel).toBe('2. poluvrijeme');
    expect(res!.displayMinute).toBe(46);
  });

  it('computeLiveClock EXTRA i showStoppage', () => {
    const now = Date.now();
    const startedAt = new Date(now - 20 * 60 * 1000).toISOString();
    const res = computeLiveClock({ status: 'LIVE', clockStartedAt: startedAt, matchPeriod: 'EXTRA_FIRST', stoppageExtraFirst: 2 });
    expect(res!.periodLabel).toBe('1. produžetak');
    expect(res!.displayMinute).toBeGreaterThan(91);
    const far = computeLiveClock({ status: 'LIVE', clockStartedAt: new Date(now - 50 * 60 * 1000).toISOString(), matchPeriod: 'FIRST_HALF', stoppageFirstHalf: 3 });
    expect(far?.showStoppage).toBe(true);
    expect(far?.stoppage).toBe(3);
    const noStop = computeLiveClock({ status: 'LIVE', clockStartedAt: new Date(now - 50 * 60 * 1000).toISOString(), matchPeriod: 'FIRST_HALF', stoppageFirstHalf: 0 });
    expect(noStop?.showStoppage).toBe(false);
  });

  it('formatLiveMinute sa stoppage i fallback', () => {
    expect(formatLiveMinute(null, 7)).toBe("7'");
    expect(formatLiveMinute(null)).toBe("0'");
    const clock = { displayMinute: 45, displaySecond: 5, periodLabel: '1. poluvrijeme', showStoppage: false, stoppage: 0 } as never;
    expect(formatLiveMinute(clock)).toBe('45:05');
    const stop = { displayMinute: 47, displaySecond: 0, periodLabel: '1. poluvrijeme', showStoppage: true, stoppage: 3 } as never;
    expect(formatLiveMinute(stop)).toBe('47:00 (+3)');
  });

  it('getApiErrorMessage axios nepoznat message fallback', () => {
    const err1 = { isAxiosError: true, response: { data: { message: 123 } } } as never;
    expect(getApiErrorMessage(err1, 'fb')).toBe('fb');
    const err2 = { isAxiosError: true, response: { data: { message: null } } } as never;
    expect(getApiErrorMessage(err2, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error(''), 'fallback')).toBe('fallback');
  });
});
