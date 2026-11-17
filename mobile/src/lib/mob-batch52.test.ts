import { describe, expect, it, vi, beforeEach } from 'vitest';
vi.mock('expo-constants', () => ({ default: { expoConfig: { extra: { eas: { projectId: 'test-project' } } }, easConfig: undefined } }));
vi.mock('expo-device', () => ({ isDevice: true, osName: 'Android' }));
vi.mock('expo-notifications', () => ({
  setNotificationHandler: vi.fn(),
  addNotificationResponseReceivedListener: vi.fn((cb:any)=>({ remove: vi.fn() })),
  requestPermissionsAsync: vi.fn(()=> Promise.resolve({ granted: true })),
  getExpoPushTokenAsync: vi.fn(()=> Promise.resolve({ data: 'ExponentPushToken[test]' })),
}));
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(()=> Promise.resolve(null)),
  setItemAsync: vi.fn(()=> Promise.resolve()),
  deleteItemAsync: vi.fn(()=> Promise.resolve()),
}));
vi.mock('expo-router', () => ({ router: { push: vi.fn() } }));
vi.mock('./api', () => ({ api: { post: vi.fn(()=> Promise.resolve({})), delete: vi.fn(()=> Promise.resolve({})) } }));
vi.mock('socket.io-client', () => ({ io: vi.fn(()=> ({ disconnect: vi.fn(), on: vi.fn(), off: vi.fn() })) }));

import { registerPushDeepLinks, ensurePushRegistration, clearPushRegistration } from './push';
import { getRealtimeSocket, disconnectRealtimeSocket, getAuthRealtimeSocket, disconnectAuthRealtimeSocket } from './realtime';

describe('mob-batch52 — P-MOB52 push/realtime', () => {
  beforeEach(()=> vi.clearAllMocks());
  it('registerPushDeepLinks returns unsubscribe', () => {
    const unsub = registerPushDeepLinks();
    expect(typeof unsub).toBe('function');
    unsub();
  });
  it('ensurePushRegistration no throw when Device true', async () => {
    await expect(ensurePushRegistration()).resolves.toBeUndefined();
  });
  it('clearPushRegistration no token', async () => {
    const { getItemAsync } = await import('expo-secure-store');
    (getItemAsync as any).mockResolvedValueOnce(null);
    await expect(clearPushRegistration()).resolves.toBeUndefined();
  });
  it('clearPushRegistration with token', async () => {
    const { getItemAsync } = await import('expo-secure-store');
    (getItemAsync as any).mockResolvedValueOnce('token123');
    await expect(clearPushRegistration()).resolves.toBeUndefined();
  });
  it('getRealtimeSocket same instance', () => {
    const a = getRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).toBe(b);
  });
  it('disconnectRealtimeSocket clears', () => {
    const s = getRealtimeSocket();
    disconnectRealtimeSocket();
    const s2 = getRealtimeSocket();
    expect(s).not.toBe(s2);
  });
  it('getAuthRealtimeSocket same token same instance', () => {
    const a = getAuthRealtimeSocket('tok1');
    const b = getAuthRealtimeSocket('tok1');
    expect(a).toBe(b);
  });
  it('getAuthRealtimeSocket different token new instance', () => {
    const a = getAuthRealtimeSocket('tok1');
    const b = getAuthRealtimeSocket('tok2');
    expect(a).not.toBe(b);
  });
  it('disconnectAuthRealtimeSocket', () => {
    getAuthRealtimeSocket('tok');
    disconnectAuthRealtimeSocket();
    const s = getAuthRealtimeSocket('tok');
    expect(s).toBeDefined();
  });
  it('ensurePushRegistration handles permission denied', async () => {
    const { requestPermissionsAsync } = await import('expo-notifications');
    (requestPermissionsAsync as any).mockResolvedValueOnce({ granted: false });
    await expect(ensurePushRegistration()).resolves.toBeUndefined();
  });
  it('registerPushDeepLinks calls Notifications', async () => {
    const { addNotificationResponseReceivedListener } = await import('expo-notifications');
    registerPushDeepLinks();
    expect(addNotificationResponseReceivedListener).toHaveBeenCalled();
  });
});
