import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: { extra: { eas: { projectId: 'proj-123' } } },
    easConfig: undefined,
  },
}));

vi.mock('expo-device', () => ({
  isDevice: true,
  osName: 'iOS',
}));

vi.mock('expo-notifications', () => ({
  setNotificationHandler: vi.fn(),
  requestPermissionsAsync: vi.fn(async () => ({ granted: true })),
  getExpoPushTokenAsync: vi.fn(async () => ({ data: 'example-xxx-token' })),
  addNotificationResponseReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
}));

vi.mock('expo-router', () => ({
  router: { push: vi.fn() },
}));

import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { clearPushRegistration, ensurePushRegistration } from './push';
import { api, fetchCurrentUser, loginRequest, logoutRequest } from './api';

// need to spy on api after import
const postSpy = vi.spyOn(api, 'post');
const getSpy = vi.spyOn(api, 'get');
const deleteSpy = vi.spyOn(api, 'delete');

describe('mob-batch08 — P-MOB08 lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // restore default device state
    (Device as unknown as { isDevice: boolean }).isDevice = true;
    // ensure Constants mock still has projectId
    // reset api spies
    postSpy.mockReset();
    getSpy.mockReset();
    deleteSpy.mockReset();
    postSpy.mockResolvedValue({ data: {} } as never);
    getSpy.mockResolvedValue({ data: {} } as never);
    deleteSpy.mockResolvedValue({} as never);
  });

  it('clearPushRegistration early return kad nema tokena', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await clearPushRegistration();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('fk_push_token');
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('clearPushRegistration briše i kad api baci', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('tok123');
    deleteSpy.mockRejectedValueOnce(new Error('net'));
    await clearPushRegistration();
    expect(deleteSpy).toHaveBeenCalledWith('/notifications/devices/tok123');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_push_token');
  });

  it('clearPushRegistration uspjeh briše lokalno', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('tokABC');
    deleteSpy.mockResolvedValueOnce({} as never);
    await clearPushRegistration();
    expect(deleteSpy).toHaveBeenCalledWith('/notifications/devices/tokABC');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_push_token');
  });

  it('ensurePushRegistration no-op kad nije device', async () => {
    (Device as unknown as { isDevice: boolean }).isDevice = false;
    await ensurePushRegistration();
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('ensurePushRegistration no-op kad permission denied', async () => {
    vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({
      granted: false,
    } as never);
    await ensurePushRegistration();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('ensurePushRegistration ne šalje kad isti token', async () => {
    vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({
      granted: true,
    } as never);
    vi.mocked(Notifications.getExpoPushTokenAsync).mockResolvedValueOnce({
      data: 'example-same-xxx',
    } as never);
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('example-same-xxx');
    await ensurePushRegistration();
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('ensurePushRegistration šalje novi token', async () => {
    vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({
      granted: true,
    } as never);
    vi.mocked(Notifications.getExpoPushTokenAsync).mockResolvedValueOnce({
      data: 'example-new-xxx',
    } as never);
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('old');
    postSpy.mockResolvedValueOnce({ data: {} } as never);
    await ensurePushRegistration();
    expect(postSpy).toHaveBeenCalledWith('/notifications/devices', {
      token: 'example-new-xxx',
      platform: 'iOS',
    });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'fk_push_token',
      'example-new-xxx',
    );
  });

  it('loginRequest pohranjuje tokene i usera', async () => {
    const loginRes = {
      accessToken: 'a1',
      refreshToken: 'r1',
      user: { id: 'u1', email: 'a@b.c' },
    };
    postSpy.mockResolvedValueOnce({ data: loginRes } as never);
    const res = await loginRequest('a@b.c', 'pass');
    expect(res).toEqual(loginRes);
    expect(postSpy).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'pass' });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_access_token', 'a1');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_refresh_token', 'r1');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_user', JSON.stringify(loginRes.user));
  });

  it('fetchCurrentUser pohranjuje usera', async () => {
    const user = { id: 'u2', email: 'x@y.z' };
    getSpy.mockResolvedValueOnce({ data: user } as never);
    const res = await fetchCurrentUser();
    expect(res).toEqual(user);
    expect(getSpy).toHaveBeenCalledWith('/auth/me');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_user', JSON.stringify(user));
  });

  it('logoutRequest briše tokene i kad api baci', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('refTok');
    postSpy.mockRejectedValueOnce(new Error('net'));
    await logoutRequest();
    expect(postSpy).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refTok' });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_access_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_refresh_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_user');
  });

  it('logoutRequest bez refresh tokena samo briše', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await logoutRequest();
    expect(postSpy).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_access_token');
  });
});
