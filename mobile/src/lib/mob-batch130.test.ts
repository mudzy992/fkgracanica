import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('socket.io-client', () => {
  const mockIo = vi.fn(() => ({ disconnect: vi.fn(), id: Math.random() }));
  return { io: mockIo };
});

import { io } from 'socket.io-client';
import { disconnectAuthRealtimeSocket, disconnectRealtimeSocket, getAuthRealtimeSocket, getRealtimeSocket } from './realtime';
import { resolveListStatus } from './screen-state';
import { brand, colors, darkColors, spacing, typography } from './theme';

describe('mob-batch130 — P-MOB43 realtime/screen/theme (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); disconnectRealtimeSocket(); disconnectAuthRealtimeSocket(); });

  it('getRealtimeSocket singleton reuse', () => {
    const a = getRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('disconnectRealtimeSocket resets singleton', () => {
    const a = getRealtimeSocket();
    disconnectRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).not.toBe(b);
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('realtimeUrl env override and fallback', () => {
    vi.stubEnv('EXPO_PUBLIC_REALTIME_URL', 'https://rt.example.com');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith('https://rt.example.com', expect.any(Object));
    delete (process.env as any).EXPO_PUBLIC_REALTIME_URL;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    const url = vi.mocked(io).mock.calls.at(-1)?.[0] as string;
    expect(url).toContain('/realtime');
  });
  it('socket path custom and default', () => {
    vi.stubEnv('EXPO_PUBLIC_SOCKET_IO_PATH', '/custom-io');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/custom-io' }));
    delete (process.env as any).EXPO_PUBLIC_SOCKET_IO_PATH;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/socket.io' }));
  });
  it('transports and reconnection options', () => {
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ transports: ['websocket', 'polling'], reconnection: true }));
  });
  it('getAuthRealtimeSocket reuse same token', () => {
    const a = getAuthRealtimeSocket('example-same');
    const b = getAuthRealtimeSocket('example-same');
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('getAuthRealtimeSocket different token new socket', () => {
    const a = getAuthRealtimeSocket('example-a');
    const b = getAuthRealtimeSocket('example-b');
    expect(a).not.toBe(b);
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('getAuth includes auth token and disconnect clears', () => {
    getAuthRealtimeSocket('placeholder-example');
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ auth: { token: 'placeholder-example' } }));
    const a = getAuthRealtimeSocket('placeholder-example');
    disconnectAuthRealtimeSocket();
    const b = getAuthRealtimeSocket('placeholder-example');
    expect(a).not.toBe(b);
  });
  it('disconnect safe when null', () => {
    expect(() => disconnectRealtimeSocket()).not.toThrow();
    expect(() => disconnectAuthRealtimeSocket()).not.toThrow();
    disconnectRealtimeSocket();
    disconnectAuthRealtimeSocket();
    expect(() => disconnectRealtimeSocket()).not.toThrow();
  });
  it('resolveListStatus loading error empty idle', () => {
    expect(resolveListStatus({ loading: true, error: 'e', itemCount: 5 })).toBe('loading');
    expect(resolveListStatus({ loading: false, error: 'err', itemCount: 5 })).toBe('error');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 0 })).toBe('empty');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 3 })).toBe('idle');
  });
  it('theme brand primary/accent/white', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.accent).toBe('#2563EB');
    expect(brand.white).toBe('#FFFFFF');
    expect(brand.primaryLight).toBe('#93C5FD');
  });
  it('darkColors palette and colors alias', () => {
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.surface).toBe('#0A1525');
    expect(darkColors.text).toBe('#F8FAFC');
    expect(darkColors.textMuted).toBe('#94A3B8');
    expect(darkColors.border).toBe('#334155');
    expect(darkColors.link).toBe('#93C5FD');
    expect(colors).toBe(darkColors);
  });
  it('spacing all values', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(16);
    expect(spacing.lg).toBe(24);
    expect(spacing.xl).toBe(32);
  });
  it('typography sizes and weights', () => {
    expect(typography.display.fontSize).toBe(34);
    expect(typography.display.fontWeight).toBe('800');
    expect(typography.title.fontSize).toBe(24);
    expect(typography.heading.fontSize).toBe(18);
    expect(typography.body.fontSize).toBe(16);
    expect(typography.caption.fontSize).toBe(13);
  });
  it('brand darkColors link equals primaryLight', () => {
    expect(darkColors.link).toBe(brand.primaryLight);
    expect(darkColors.primary).toBe(brand.primary);
    expect(darkColors.accent).toBe(brand.accent);
  });
});
