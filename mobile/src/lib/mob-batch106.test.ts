import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('socket.io-client', () => {
  const mockIo = vi.fn(() => ({ disconnect: vi.fn(), id: Math.random() }));
  return { io: mockIo };
});

import { io } from 'socket.io-client';
import { getRealtimeSocket, disconnectRealtimeSocket, getAuthRealtimeSocket, disconnectAuthRealtimeSocket } from './realtime';
import { resolveListStatus } from './screen-state';
import { brand, darkColors, colors, spacing } from './theme';

describe('mob-batch106 — P-MOB19 realtime/screen/theme (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); disconnectRealtimeSocket(); disconnectAuthRealtimeSocket(); });

  it('getRealtimeSocket singleton returns same instance', () => {
    const a = getRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('disconnectRealtimeSocket clears singleton', () => {
    const first = getRealtimeSocket();
    disconnectRealtimeSocket();
    const second = getRealtimeSocket();
    expect(first).not.toBe(second);
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('getRealtimeSocket uses EXPO_PUBLIC_REALTIME_URL', () => {
    vi.stubEnv('EXPO_PUBLIC_REALTIME_URL', 'https://rt.example.com');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith('https://rt.example.com', expect.any(Object));
  });
  it('getRealtimeSocket fallback to API origin /realtime', () => {
    vi.stubEnv('EXPO_PUBLIC_REALTIME_URL', '');
    delete (process.env as any).EXPO_PUBLIC_REALTIME_URL;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    const url = vi.mocked(io).mock.calls.at(-1)?.[0] as string;
    expect(url).toMatch(/\/realtime$/);
  });
  it('getRealtimeSocket custom socket path', () => {
    vi.stubEnv('EXPO_PUBLIC_SOCKET_IO_PATH', '/my-socket');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/my-socket' }));
  });
  it('getRealtimeSocket default path is /socket.io', () => {
    vi.stubEnv('EXPO_PUBLIC_SOCKET_IO_PATH', '');
    delete (process.env as any).EXPO_PUBLIC_SOCKET_IO_PATH;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/socket.io' }));
  });
  it('getAuthRealtimeSocket reuses for same token', () => {
    const a = getAuthRealtimeSocket('tokenA');
    const b = getAuthRealtimeSocket('tokenA');
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('getAuthRealtimeSocket creates new for different token', () => {
    const a = getAuthRealtimeSocket('tok1');
    const b = getAuthRealtimeSocket('tok2');
    expect(a).not.toBe(b);
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('disconnectAuthRealtimeSocket clears auth socket', () => {
    const a = getAuthRealtimeSocket('abc');
    disconnectAuthRealtimeSocket();
    const b = getAuthRealtimeSocket('abc');
    expect(a).not.toBe(b);
  });
  it('getAuthRealtimeSocket passes auth token', () => {
    getAuthRealtimeSocket('secret123');
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ auth: { token: 'secret123' } }));
  });
  it('disconnect functions safe when no socket', () => {
    disconnectRealtimeSocket();
    disconnectRealtimeSocket();
    disconnectAuthRealtimeSocket();
    expect(() => disconnectAuthRealtimeSocket()).not.toThrow();
  });
  it('resolveListStatus covers all states', () => {
    expect(resolveListStatus({ loading: true, error: null, itemCount: 5 })).toBe('loading');
    expect(resolveListStatus({ loading: false, error: 'x', itemCount: 5 })).toBe('error');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 0 })).toBe('empty');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 3 })).toBe('idle');
  });
  it('resolveListStatus loading over error', () => {
    expect(resolveListStatus({ loading: true, error: 'e', itemCount: 0 })).toBe('loading');
  });
  it('theme brand and darkColors values', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.white).toBe('#FFFFFF');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.surface).toBe('#0A1525');
    expect(colors).toBe(darkColors);
    expect(spacing.md).toBe(16);
  });
  it('realtime uses websocket polling transports', () => {
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ transports: ['websocket', 'polling'] }));
  });
});
