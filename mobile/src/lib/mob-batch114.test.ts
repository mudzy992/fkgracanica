import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('expo-constants', () => ({ default: { expoConfig: { extra: { eas: { projectId: 'proj123' } } }, easConfig: {} } }));
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
import { ensurePushRegistration, clearPushRegistration, registerPushDeepLinks } from './push';
import { resolveListStatus } from './screen-state';
import { shareImageFile, saveImageToLibrary } from './share-media';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { api } from './api';

describe('mob-batch114 — P-MOB27 screen/push/share (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); (Device as any).isDevice = true; });

  it('resolveListStatus loading precedence', () => {
    expect(resolveListStatus({ loading: true, error: 'e', itemCount: 10 })).toBe('loading');
  });
  it('resolveListStatus error empty idle', () => {
    expect(resolveListStatus({ loading: false, error: 'err', itemCount: 5 })).toBe('error');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 0 })).toBe('empty');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 3 })).toBe('idle');
  });
  it('registerPushDeepLinks subscribes', () => {
    const off = registerPushDeepLinks();
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    expect(typeof off).toBe('function');
    off();
  });
  it('ensurePushRegistration not device', async () => {
    (Device as any).isDevice = false;
    await ensurePushRegistration();
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });
  it('ensurePushRegistration permission denied', async () => {
    vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({ granted: false } as any);
    await ensurePushRegistration();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });
  it('ensurePushRegistration missing projectId', async () => {
    (Constants as any).expoConfig = {};
    (Constants as any).easConfig = {};
    await ensurePushRegistration();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    (Constants as any).expoConfig = { extra: { eas: { projectId: 'proj123' } } };
  });
  it('ensurePushRegistration unchanged token', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('ExponentPushToken[example]');
    await ensurePushRegistration();
    expect(api.post).not.toHaveBeenCalled();
  });
  it('ensurePushRegistration new token', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('old');
    await ensurePushRegistration();
    expect(api.post).toHaveBeenCalledWith('/notifications/devices', expect.objectContaining({ token: 'ExponentPushToken[example]' }));
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_push_token', 'ExponentPushToken[example]');
  });
  it('ensurePushRegistration swallows error', async () => {
    vi.mocked(Notifications.getExpoPushTokenAsync).mockRejectedValueOnce(new Error('503'));
    await expect(ensurePushRegistration()).resolves.toBeUndefined();
  });
  it('clearPushRegistration no token', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await clearPushRegistration();
    expect(api.delete).not.toHaveBeenCalled();
  });
  it('clearPushRegistration deletes', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('tokABC');
    await clearPushRegistration();
    expect(api.delete).toHaveBeenCalledWith('/notifications/devices/tokABC');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_push_token');
  });
  it('clearPushRegistration swallows delete error', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('tok');
    vi.mocked(api.delete).mockRejectedValueOnce(new Error('fail'));
    await expect(clearPushRegistration()).resolves.toBeUndefined();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });
  it('shareImageFile missing-url', async () => {
    await expect(shareImageFile('')).rejects.toThrow('missing-url');
  });
  it('shareImageFile unavailable and success', async () => {
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(false);
    await expect(shareImageFile('originals/a.jpg')).rejects.toThrow('sharing-unavailable');
    vi.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(true);
    await expect(shareImageFile('originals/b.png')).resolves.toBeUndefined();
    expect(Sharing.shareAsync).toHaveBeenCalled();
  });
  it('saveImageToLibrary permission and success', async () => {
    vi.mocked(MediaLibrary.requestPermissionsAsync).mockResolvedValueOnce({ granted: false } as any);
    await expect(saveImageToLibrary('originals/c.jpg')).rejects.toThrow('permission-denied');
    vi.mocked(MediaLibrary.requestPermissionsAsync).mockResolvedValueOnce({ granted: true } as any);
    await expect(saveImageToLibrary('originals/c.jpg')).resolves.toBeUndefined();
    expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalled();
  });
});
