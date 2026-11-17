import { describe, expect, it, vi, beforeEach } from 'vitest';
const store = new Map<string,string>();
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn((k:string)=> Promise.resolve(store.get(k) ?? null)),
  setItemAsync: vi.fn((k:string,v:string)=> { store.set(k,v); return Promise.resolve(); }),
  deleteItemAsync: vi.fn((k:string)=> { store.delete(k); return Promise.resolve(); }),
}));
import { API_URL, getAccessToken, getRefreshToken, setTokens, clearTokens, getStoredUser, setStoredUser, api } from './api';
describe('mob-batch51 — P-MOB51 api tokens', () => {
  beforeEach(()=> store.clear());
  it('API_URL default', () => { expect(API_URL).toContain('/api/v1'); });
  it('api baseURL', () => { expect(api.defaults.baseURL).toBe(API_URL); });
  it('getAccessToken null initially', async () => { expect(await getAccessToken()).toBeNull(); });
  it('setTokens + getAccessToken', async () => { await setTokens('a1','r1'); expect(await getAccessToken()).toBe('a1'); expect(await getRefreshToken()).toBe('r1'); });
  it('clearTokens', async () => { await setTokens('a','r'); await clearTokens(); expect(await getAccessToken()).toBeNull(); expect(await getRefreshToken()).toBeNull(); });
  it('setStoredUser/getStoredUser', async () => { const u={id:'1',email:'a@b'} as any; await setStoredUser(u); expect(await getStoredUser()).toEqual(u); });
  it('getStoredUser null', async () => { expect(await getStoredUser()).toBeNull(); });
  it('getStoredUser invalid json', async () => { store.set('fk_user','{bad'); expect(await getStoredUser()).toBeNull(); });
  it('setTokens overwrites', async () => { await setTokens('a','r'); await setTokens('b','s'); expect(await getAccessToken()).toBe('b'); });
  it('clearTokens idempotent', async () => { await clearTokens(); expect(await getAccessToken()).toBeNull(); });
  it('api has interceptors', () => { expect((api.interceptors.request as any)).toBeDefined(); });
});
