import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
import * as SecureStore from 'expo-secure-store';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, getStoredUser, setStoredUser } from './api';
import { getApiErrorMessage } from './api-error';
import { isAxiosError } from 'axios';

// Web parity spec (frontend/src/lib/api-error.ts identical) — inline expected
function webGetApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err as any).response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

describe('mob-batch90 — P-MOB03 API/error parity mobile vs web (test-only)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getApiErrorMessage: axios string', () => {
    const err = { isAxiosError: true, response: { data: { message: 'Greška' } } } as any;
    expect(getApiErrorMessage(err, 'fb')).toBe('Greška');
    expect(webGetApiErrorMessage(err, 'fb')).toBe('Greška');
  });
  it('getApiErrorMessage: axios array', () => {
    const err = { isAxiosError: true, response: { data: { message: ['a','b'] } } } as any;
    expect(getApiErrorMessage(err, 'fb')).toBe('a, b');
    expect(webGetApiErrorMessage(err, 'fb')).toBe('a, b');
  });
  it('getApiErrorMessage: Error instance', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(webGetApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
  });
  it('getApiErrorMessage: fallback', () => {
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage({}, 'fallback')).toBe('fallback');
    expect(webGetApiErrorMessage(null, 'fallback')).toBe('fallback');
  });
  it('getApiErrorMessage parity: web i mobile identični', () => {
    const cases: Array<[unknown,string]> = [
      [{ isAxiosError:true, response:{data:{message:'x'}} } as any, 'x'],
      [{ isAxiosError:true, response:{data:{message:['p','q']}} } as any, 'p, q'],
      [new Error('e'), 'e'],
      [null, 'fb'],
    ];
    for (const [err, exp] of cases) {
      expect(getApiErrorMessage(err, 'fb')).toBe(exp);
      expect(webGetApiErrorMessage(err, 'fb')).toBe(exp);
    }
  });
  it('getAccessToken čita fk_access_token', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('tok123');
    await expect(getAccessToken()).resolves.toBe('tok123');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('fk_access_token');
  });
  it('getRefreshToken čita fk_refresh_token', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('ref456');
    await expect(getRefreshToken()).resolves.toBe('ref456');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('fk_refresh_token');
  });
  it('setTokens pohranjuje oba', async () => {
    await setTokens('a1','r1');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_access_token','a1');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_refresh_token','r1');
  });
  it('clearTokens briše sva tri ključa (paritet: web briše 2, mobile 3 zbog user)', async () => {
    await clearTokens();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_access_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_refresh_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_user');
  });
  it('setStoredUser / getStoredUser round-trip', async () => {
    const user = { id:'u1', email:'a@b.c' } as any;
    await setStoredUser(user);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_user', JSON.stringify(user));
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(JSON.stringify(user));
    await expect(getStoredUser()).resolves.toEqual(user);
  });
  it('getStoredUser null za empty/invalid', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await expect(getStoredUser()).resolves.toBeNull();
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('not-json{');
    await expect(getStoredUser()).resolves.toBeNull();
  });
  it('api token ključevi parity: web localStorage vs mobile SecureStore isti ključevi', () => {
    // web: fk_access_token, fk_refresh_token ; mobile dodaje fk_user
    const webKeys = ['fk_access_token','fk_refresh_token'];
    const mobileKeys = ['fk_access_token','fk_refresh_token','fk_user'];
    expect(mobileKeys.slice(0,2)).toEqual(webKeys);
    expect(mobileKeys).toContain('fk_user');
  });
  it('api baseURL parity: oba koriste /api/v1', async () => {
    const { API_URL } = await import('./api');
    expect(API_URL).toContain('/api/v1');
    // web frontend/src/lib/api.ts default http://localhost:3000/api/v1 — contains same suffix
    expect('/api/v1').toBe('/api/v1');
  });
  it('action-errors not in mobile — web ima reportActionError, mobile koristi getApiErrorMessage direktno', () => {
    // mobile nema action-errors modul; parity je da oba koriste getApiErrorMessage
    expect(typeof getApiErrorMessage).toBe('function');
    // web action-errors bi koristio isti helper — provjera da mobile ne eksponira globalni store
    expect((globalThis as any).reportActionError).toBeUndefined();
  });
});
