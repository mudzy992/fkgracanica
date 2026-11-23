import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('socket.io-client', () => {
  const mockIo = vi.fn(() => ({ disconnect: vi.fn(), id: Math.random() }));
  return { io: mockIo };
});
vi.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: vi.fn(async () => ({ canceled: false, assets: [{ uri: 'file://a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' }] })),
}));
vi.mock('./api', () => ({ api: { post: vi.fn(async () => ({ data: { path: 'uploads/example.jpg' } })) } }));

import { io } from 'socket.io-client';
import { disconnectAuthRealtimeSocket, disconnectRealtimeSocket, getAuthRealtimeSocket, getRealtimeSocket } from './realtime';
import { uploadMedia } from './upload-media';
import { brand, darkColors, colors, spacing, typography } from './theme';
import * as ImagePicker from 'expo-image-picker';
import { api } from './api';

describe('mob-batch139 — P-MOB52 realtime/upload/theme (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); disconnectRealtimeSocket(); disconnectAuthRealtimeSocket(); });

  it('getRealtimeSocket singleton', () => {
    const a = getRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('disconnectRealtimeSocket clears', () => {
    const a = getRealtimeSocket();
    disconnectRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).not.toBe(b);
  });
  it('realtimeUrl env and fallback', () => {
    vi.stubEnv('EXPO_PUBLIC_REALTIME_URL', 'https://rt.example.com');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith('https://rt.example.com', expect.any(Object));
    delete (process.env as any).EXPO_PUBLIC_REALTIME_URL;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(vi.mocked(io).mock.calls.at(-1)?.[0] as string).toContain('/realtime');
  });
  it('socket path custom and default', () => {
    vi.stubEnv('EXPO_PUBLIC_SOCKET_IO_PATH', '/custom');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/custom' }));
    delete (process.env as any).EXPO_PUBLIC_SOCKET_IO_PATH;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/socket.io' }));
  });
  it('transports and reconnection', () => {
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ transports: ['websocket', 'polling'] }));
  });
  it('getAuth reuse same token', () => {
    const a = getAuthRealtimeSocket('example-same');
    const b = getAuthRealtimeSocket('example-same');
    expect(a).toBe(b);
  });
  it('getAuth new token new socket', () => {
    const a = getAuthRealtimeSocket('example-a');
    const b = getAuthRealtimeSocket('example-b');
    expect(a).not.toBe(b);
  });
  it('getAuth passes auth token', () => {
    getAuthRealtimeSocket('placeholder-example-token');
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ auth: { token: 'placeholder-example-token' } }));
  });
  it('disconnect safe', () => {
    expect(() => disconnectRealtimeSocket()).not.toThrow();
    expect(() => disconnectAuthRealtimeSocket()).not.toThrow();
  });
  it('uploadMedia permission denied', async () => {
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValueOnce({ granted: false } as any);
    await expect(uploadMedia()).rejects.toThrow('Media library permission denied');
  });
  it('uploadMedia cancelled cases', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: true, assets: [] } as any);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [] } as any);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
  });
  it('uploadMedia fallback and post', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file://x', fileName: null, mimeType: null }] } as any);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { path: 'uploads/example.jpg' } } as any);
    expect(await uploadMedia()).toBe('uploads/example.jpg');
    expect(api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), expect.any(Object));
  });
  it('theme brand and darkColors', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.white).toBe('#FFFFFF');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.text).toBe('#F8FAFC');
    expect(colors).toBe(darkColors);
  });
  it('spacing and typography', () => {
    expect(spacing.md).toBe(16);
    expect(spacing.xl).toBe(32);
    expect(typography.display.fontSize).toBe(34);
    expect(typography.caption.fontSize).toBe(13);
  });
  it('theme link equals primaryLight', () => {
    expect(darkColors.link).toBe(brand.primaryLight);
    expect(darkColors.border).toBe('#334155');
  });
});
