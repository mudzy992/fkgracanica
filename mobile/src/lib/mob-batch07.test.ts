import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

vi.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: vi.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file://photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg' }],
  })),
}));

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({ disconnect: vi.fn(), on: vi.fn(), emit: vi.fn() })),
}));

vi.mock('./api', () => ({
  API_URL: 'https://api.fkgracanica.ba101.top/api/v1',
  api: {
    post: vi.fn(async () => ({ data: { path: 'uploads/test.jpg' } })),
    get: vi.fn(async () => ({ data: {} })),
    delete: vi.fn(async () => ({})),
  },
}));

import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { io } from 'socket.io-client';
import { api } from './api';
import { trackMobileVisit } from './visitor';
import { uploadMedia } from './upload-media';
import {
  disconnectAuthRealtimeSocket,
  disconnectRealtimeSocket,
  getAuthRealtimeSocket,
  getRealtimeSocket,
} from './realtime';

describe('mob-batch07 — P-MOB07 lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnectRealtimeSocket();
    disconnectAuthRealtimeSocket();
  });

  it('trackMobileVisit koristi postojeći visitorId', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('existing-id-123');
    await trackMobileVisit();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('fk_mobile_visitor_id');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(api.post).toHaveBeenCalledWith('/public-analytics/visit', {
      platform: 'mobile',
      visitorId: 'existing-id-123',
    });
  });

  it('trackMobileVisit generira novi id kad nema', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await trackMobileVisit();
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    const newId = vi.mocked(SecureStore.setItemAsync).mock.calls[0]?.[1] as string;
    expect(newId).toMatch(/^[0-9a-f]{32}$/);
    expect(api.post).toHaveBeenCalledWith('/public-analytics/visit', {
      platform: 'mobile',
      visitorId: newId,
    });
  });

  it('trackMobileVisit nikad ne baca kad api padne', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('id1');
    vi.mocked(api.post).mockRejectedValueOnce(new Error('net'));
    await expect(trackMobileVisit()).resolves.toBeUndefined();
  });

  it('uploadMedia baca kad permission denied', async () => {
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValueOnce({
      granted: false,
    } as never);
    await expect(uploadMedia()).rejects.toThrow('Media library permission denied');
  });

  it('uploadMedia baca cancelled kad nema asset', async () => {
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValueOnce({
      granted: true,
    } as never);
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
      canceled: true,
      assets: [],
    } as never);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
  });

  it('uploadMedia uspjeh vraća path', async () => {
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValueOnce({
      granted: true,
    } as never);
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file://a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' }],
    } as never);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { path: 'uploads/a.jpg' } } as never);
    await expect(uploadMedia()).resolves.toBe('uploads/a.jpg');
  });

  it('uploadMedia fallback mime i name', async () => {
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValueOnce({
      granted: true,
    } as never);
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file://x', fileName: null, mimeType: null }],
    } as never);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { path: 'uploads/fallback.jpg' } } as never);
    await expect(uploadMedia()).resolves.toBe('uploads/fallback.jpg');
    const form = vi.mocked(api.post).mock.calls.at(-1)?.[1] as FormData;
    expect(form).toBeDefined();
  });

  it('getRealtimeSocket vraća istu instancu', () => {
    const a = getRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });

  it('disconnectRealtimeSocket poziva disconnect i nullira', () => {
    const s = getRealtimeSocket() as unknown as { disconnect: ReturnType<typeof vi.fn> };
    disconnectRealtimeSocket();
    expect(s.disconnect).toHaveBeenCalled();
    const next = getRealtimeSocket();
    expect(next).not.toBe(s);
    expect(io).toHaveBeenCalledTimes(2);
  });

  it('getAuthRealtimeSocket cache za isti token', () => {
    const a = getAuthRealtimeSocket('tok1');
    const b = getAuthRealtimeSocket('tok1');
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });

  it('getAuthRealtimeSocket novi token disconnecta stari', () => {
    const a = getAuthRealtimeSocket('tok1') as unknown as { disconnect: ReturnType<typeof vi.fn> };
    const b = getAuthRealtimeSocket('tok2');
    expect(b).not.toBe(a);
    expect(a.disconnect).toHaveBeenCalled();
    expect(io).toHaveBeenCalledTimes(2);
  });

  it('disconnectAuth čisti token i socket', () => {
    getAuthRealtimeSocket('tokX');
    disconnectAuthRealtimeSocket();
    const after = getAuthRealtimeSocket('tokX');
    expect(io).toHaveBeenCalledTimes(2);
    expect(after).toBeDefined();
  });
});
