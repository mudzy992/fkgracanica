import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('socket.io-client', () => {
  const mockIo = vi.fn(() => ({ disconnect: vi.fn(), id: Math.random() }));
  return { io: mockIo };
});

import { io } from 'socket.io-client';
import { getRealtimeSocket, disconnectRealtimeSocket, getAuthRealtimeSocket, disconnectAuthRealtimeSocket } from './realtime';
import { resolveListStatus } from './screen-state';
import { brand, darkColors, colors, spacing, typography } from './theme';

describe('mob-batch115 — P-MOB28 realtime/screen/theme (test-only)', () => {
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
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('getRealtimeSocket uses REALTIME_URL', () => {
    vi.stubEnv('EXPO_PUBLIC_REALTIME_URL', 'https://rt.example.com');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith('https://rt.example.com', expect.any(Object));
  });
  it('getRealtimeSocket fallback /realtime', () => {
    delete (process.env as any).EXPO_PUBLIC_REALTIME_URL;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    const url = vi.mocked(io).mock.calls.at(-1)?.[0] as string;
    expect(url).toContain('/realtime');
  });
  it('custom socket path', () => {
    vi.stubEnv('EXPO_PUBLIC_SOCKET_IO_PATH', '/custom-io');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/custom-io' }));
  });
  it('default socket path', () => {
    delete (process.env as any).EXPO_PUBLIC_SOCKET_IO_PATH;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/socket.io' }));
  });
  it('getAuthRealtimeSocket reuse same token', () => {
    const a = getAuthRealtimeSocket('same');
    const b = getAuthRealtimeSocket('same');
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('getAuthRealtimeSocket new for different token', () => {
    const a = getAuthRealtimeSocket('a');
    const b = getAuthRealtimeSocket('b');
    expect(a).not.toBe(b);
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('disconnectAuth clears', () => {
    const a = getAuthRealtimeSocket('tok');
    disconnectAuthRealtimeSocket();
    const b = getAuthRealtimeSocket('tok');
    expect(a).not.toBe(b);
  });
  it('getAuth passes auth token', () => {
    getAuthRealtimeSocket('myToken');
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ auth: { token: 'myToken' } }));
  });
  it('disconnect safe when null', () => {
    expect(() => disconnectRealtimeSocket()).not.toThrow();
    expect(() => disconnectAuthRealtimeSocket()).not.toThrow();
  });
  it('resolveListStatus all states', () => {
    expect(resolveListStatus({ loading: true, error: null, itemCount: 1 })).toBe('loading');
    expect(resolveListStatus({ loading: false, error: 'e', itemCount: 1 })).toBe('error');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 0 })).toBe('empty');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 5 })).toBe('idle');
  });
  it('theme brand darkColors spacing typography', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.white).toBe('#FFFFFF');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.text).toBe('#F8FAFC');
    expect(colors).toBe(darkColors);
    expect(spacing.md).toBe(16);
    expect(typography.display.fontSize).toBe(34);
  });
  it('transports websocket polling', () => {
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ transports: ['websocket', 'polling'] }));
  });
  it('brand accent and darkColors link', () => {
    expect(brand.accent).toBe('#2563EB');
    expect(darkColors.link).toBe('#93C5FD');
    expect(darkColors.border).toBe('#334155');
  });
});
