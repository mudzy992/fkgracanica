import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('socket.io-client', () => {
  const mockIo = vi.fn(() => ({ disconnect: vi.fn(), id: Math.random() }));
  return { io: mockIo };
});
vi.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: vi.fn(async () => ({ canceled: false, assets: [{ uri: 'file://a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' }] })),
}));
vi.mock('expo-linking', () => ({
  createURL: vi.fn(() => 'exp://app/payment-return'),
  parse: vi.fn((url: string) => {
    const u = new URL(url, 'https://example.com');
    const qp: Record<string, string> = {};
    u.searchParams.forEach((v, k) => { qp[k] = v; });
    return { queryParams: qp };
  }),
}));
vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: vi.fn(async () => ({ type: 'success', url: 'exp://app/payment-return?session_id=cs_test123' })),
}));
vi.mock('./api', () => ({ API_URL: 'https://api.example.com/api/v1', api: { post: vi.fn(async () => ({ data: { path: 'uploads/foto.jpg', url: 'https://pay.example.com' } })) } }));

import { io } from 'socket.io-client';
import { getRealtimeSocket, disconnectRealtimeSocket, getAuthRealtimeSocket, disconnectAuthRealtimeSocket } from './realtime';
import { uploadMedia } from './upload-media';
import { parseCheckoutKind, finishCheckoutReturn } from './start-mobile-checkout';
import * as ImagePicker from 'expo-image-picker';
import { api } from './api';

describe('mob-batch125 — P-MOB38 realtime/upload/checkout (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); disconnectRealtimeSocket(); disconnectAuthRealtimeSocket(); });

  it('getRealtimeSocket singleton', () => {
    const a = getRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('disconnectRealtimeSocket clears singleton', () => {
    const a = getRealtimeSocket();
    disconnectRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).not.toBe(b);
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('REALTIME_URL env override', () => {
    vi.stubEnv('EXPO_PUBLIC_REALTIME_URL', 'https://rt.example.com');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith('https://rt.example.com', expect.any(Object));
  });
  it('fallback realtime url contains /realtime', () => {
    delete (process.env as any).EXPO_PUBLIC_REALTIME_URL;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    const url = vi.mocked(io).mock.calls.at(-1)?.[0] as string;
    expect(url).toContain('/realtime');
  });
  it('custom socket path via env', () => {
    vi.stubEnv('EXPO_PUBLIC_SOCKET_IO_PATH', '/custom-path');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/custom-path' }));
  });
  it('default socket path /socket.io', () => {
    delete (process.env as any).EXPO_PUBLIC_SOCKET_IO_PATH;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/socket.io' }));
  });
  it('transports includes websocket and polling and reconnection', () => {
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ transports: ['websocket', 'polling'], reconnection: true }));
  });
  it('getAuthRealtimeSocket reuse same token', () => {
    const a = getAuthRealtimeSocket('example-token');
    const b = getAuthRealtimeSocket('example-token');
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('getAuthRealtimeSocket new socket for different token', () => {
    const a = getAuthRealtimeSocket('example-a');
    const b = getAuthRealtimeSocket('example-b');
    expect(a).not.toBe(b);
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('getAuth passes auth token and disconnect clears', () => {
    getAuthRealtimeSocket('placeholder-token');
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ auth: { token: 'placeholder-token' } }));
    const a = getAuthRealtimeSocket('placeholder-token');
    disconnectAuthRealtimeSocket();
    const b = getAuthRealtimeSocket('placeholder-token');
    expect(a).not.toBe(b);
    expect(() => disconnectRealtimeSocket()).not.toThrow();
    expect(() => disconnectAuthRealtimeSocket()).not.toThrow();
  });
  it('uploadMedia permission denied', async () => {
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValueOnce({ granted: false } as any);
    await expect(uploadMedia()).rejects.toThrow('Media library permission denied');
  });
  it('uploadMedia cancelled and no asset', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: true, assets: [] } as any);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [] } as any);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
  });
  it('uploadMedia uses fallback fileName/mime and posts FormData', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file://x', fileName: null, mimeType: null }] } as any);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { path: 'uploads/example.jpg' } } as any);
    const path = await uploadMedia();
    expect(path).toBe('uploads/example.jpg');
    expect(api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }));
    // explicit fileName variant
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file://y', fileName: 'custom.png', mimeType: 'image/png' }] } as any);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { path: 'uploads/custom.png' } } as any);
    await expect(uploadMedia()).resolves.toBe('uploads/custom.png');
  });
  it('parseCheckoutKind maps and defaults to tickets', () => {
    expect(parseCheckoutKind('membership')).toBe('membership');
    expect(parseCheckoutKind('season')).toBe('season');
    expect(parseCheckoutKind('tickets')).toBe('tickets');
    expect(parseCheckoutKind('unknown')).toBe('tickets');
    expect(parseCheckoutKind(undefined)).toBe('tickets');
  });
  it('finishCheckoutReturn cancelled/dismissed/paid', async () => {
    expect(await finishCheckoutReturn('tickets', 'https://example.com?cancelled=1')).toBe('cancelled');
    expect(await finishCheckoutReturn('tickets', 'https://example.com')).toBe('dismissed');
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as any);
    expect(await finishCheckoutReturn('membership', 'https://example.com?session_id=cs_dummy_example_123')).toBe('paid');
    expect(api.post).toHaveBeenCalledWith('/payments/membership/confirm-session', expect.objectContaining({ sessionId: 'cs_dummy_example_123' }));
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as any);
    expect(await finishCheckoutReturn('season', 'https://example.com?session_id=cs_example_season')).toBe('paid');
    // array session_id param handled via parse fallback
  });
});
