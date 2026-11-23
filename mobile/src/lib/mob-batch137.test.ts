import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('expo-constants', () => ({ default: { expoConfig: { extra: { eas: { projectId: 'proj137' } } }, easConfig: {} } }));
vi.mock('expo-device', () => ({ isDevice: true, osName: 'iOS' }));
vi.mock('expo-notifications', () => ({
  setNotificationHandler: vi.fn(),
  addNotificationResponseReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
  requestPermissionsAsync: vi.fn(async () => ({ granted: true })),
  getExpoPushTokenAsync: vi.fn(async () => ({ data: 'ExponentPushToken[example]' })),
}));
vi.mock('expo-router', () => ({ router: { push: vi.fn() } }));
vi.mock('expo-file-system', () => ({
  File: class { uri: string; constructor(public a:any, public b:string){ this.uri = `file:///${b}`; } static downloadFileAsync = vi.fn(async (_url:any, dest:any) => dest); },
  Paths: { cache: '/cache' },
}));
vi.mock('expo-media-library', () => ({ requestPermissionsAsync: vi.fn(async () => ({ granted: true })), saveToLibraryAsync: vi.fn(async () => {}) }));
vi.mock('expo-sharing', () => ({ isAvailableAsync: vi.fn(async () => true), shareAsync: vi.fn(async () => {}) }));
vi.mock('./api', () => ({ api: { post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => {}) } }));
vi.mock('./media', () => ({ mediaUrl: (p:string)=> p ? `https://cdn.test/${p}` : null }));

import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { clearPushRegistration, ensurePushRegistration, registerPushDeepLinks } from './push';
import { resolveListStatus } from './screen-state';
import { saveImageToLibrary, shareImageFile } from './share-media';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { api } from './api';
import { router } from 'expo-router';

describe('mob-batch137 — P-MOB50 screen/push/share (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); (Device as any).isDevice = true; });

  it('resolveListStatus loading dominates', () => {
    expect(resolveListStatus({ loading: true, error: 'e', itemCount: 10 })).toBe('loading');
    expect(resolveListStatus({ loading: true, error: null, itemCount: 0 })).toBe('loading');
  });
  it('resolveListStatus error empty idle', () => {
    expect(resolveListStatus({ loading: false, error: 'err', itemCount: 5 })).toBe('error');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 0 })).toBe('empty');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 2 })).toBe('idle');
  });
  it('registerPushDeepLinks subscribes and handles path', () => {
    let captured: any;
    vi.mocked(Notifications.addNotificationResponseReceivedListener).mockImplementationOnce((cb:any)=>{ captured = cb; return { remove: vi.fn() } as any; });
    const off = registerPushDeepLinks();
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    captured({ notification: { request: { content: { data: { path: '/player/99' } } } } });
    expect(router.push).toHaveBeenCalledWith('/player/99');
    captured({ notification: { request: { content: { data: {} } } } });
    expect(router.push).toHaveBeenCalledWith('/notifications');
    expect(typeof off).toBe('function');
    off();
  });
  it('ensurePushRegistration skips when not device', async () => {
    (Device as any).isDevice = false;
    await ensurePushRegistration();
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    (Device as any).isDevice = true;
  });
  it('ensurePushRegistration skips when permission denied', async () => {
    vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({ granted: false } as any);
    await ensurePushRegistration();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });
  it('ensurePushRegistration skips when projectId missing', async () => {
    const origExpo = (Constants as any).expoConfig;
    const origEas = (Constants as any).easConfig;
    (Constants as any).expoConfig = {};
    (Constants as any).easConfig = {};
    await ensurePushRegistration();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    (Constants as any).expoConfig = origExpo;
    (Constants as any).easConfig = origEas;
  });
  it('ensurePushRegistration posts new token', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('old-token-example');
    await ensurePushRegistration();
    expect(api.post).toHaveBeenCalledWith('/notifications/devices', expect.objectContaining({ token: 'ExponentPushToken[example]' }));
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_push_token', 'ExponentPushToken[example]');
  });
  it('ensurePushRegistration skips when token unchanged', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('ExponentPushToken[example]');
    await ensurePushRegistration();
    expect(api.post).not.toHaveBeenCalled();
  });
  it('ensurePushRegistration swallows token error', async () => {
    vi.mocked(Notifications.getExpoPushTokenAsync).mockRejectedValueOnce(new Error('503'));
    await expect(ensurePushRegistration()).resolves.toBeUndefined();
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    vi.mocked(api.post).mockRejectedValueOnce(new Error('fail'));
    await expect(ensurePushRegistration()).resolves.toBeUndefined();
  });
  it('clearPushRegistration early return', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await clearPushRegistration();
    expect(api.delete).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
  it('clearPushRegistration deletes and swallows error', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('example-token');
    await clearPushRegistration();
    expect(api.delete).toHaveBeenCalledWith('/notifications/devices/example-token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_push_token');
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('example-token-2');
    vi.mocked(api.delete).mockRejectedValueOnce(new Error('net'));
    await expect(clearPushRegistration()).resolves.toBeUndefined();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
  });
  it('shareImageFile missing-url', async () => {
    await expect(shareImageFile('')).rejects.toThrow('missing-url');
    await expect(shareImageFile(null as any)).rejects.toThrow('missing-url');
  });
  it('shareImageFile unavailable then success png', async () => {
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(false);
    await expect(shareImageFile('originals/a.jpg')).rejects.toThrow('sharing-unavailable');
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(true);
    await expect(shareImageFile('originals/photo.png')).resolves.toBeUndefined();
    expect(Sharing.shareAsync).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ mimeType: 'image/png' }));
  });
  it('shareImageFile webp and jpg mime', async () => {
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(true);
    await shareImageFile('originals/b.webp');
    expect(Sharing.shareAsync).toHaveBeenLastCalledWith(expect.any(String), expect.objectContaining({ mimeType: 'image/webp' }));
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(true);
    await shareImageFile('originals/c.jpg');
    expect(Sharing.shareAsync).toHaveBeenLastCalledWith(expect.any(String), expect.objectContaining({ mimeType: 'image/jpeg' }));
  });
  it('saveImageToLibrary permission then success', async () => {
    vi.mocked(MediaLibrary.requestPermissionsAsync).mockResolvedValueOnce({ granted: false } as any);
    await expect(saveImageToLibrary('originals/x.jpg')).rejects.toThrow('permission-denied');
    vi.mocked(MediaLibrary.requestPermissionsAsync).mockResolvedValueOnce({ granted: true } as any);
    await expect(saveImageToLibrary('originals/x.jpg')).resolves.toBeUndefined();
    expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalled();
  });
});
