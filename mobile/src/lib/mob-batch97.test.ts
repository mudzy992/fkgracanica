import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('socket.io-client', () => {
  const mockIo = vi.fn(() => ({ disconnect: vi.fn(), id: Math.random() }));
  return { io: mockIo };
});

import { io } from 'socket.io-client';
import { getRealtimeSocket, disconnectRealtimeSocket, getAuthRealtimeSocket, disconnectAuthRealtimeSocket } from './realtime';
import { resolveListStatus } from './screen-state';
import { brand, darkColors } from './theme';

describe('mob-batch97 — P-MOB10 realtime/screen/theme (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); disconnectRealtimeSocket(); disconnectAuthRealtimeSocket(); });

  it('getRealtimeSocket singleton', () => {
    const a = getRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('disconnectRealtimeSocket clears and recreates', () => {
    const a = getRealtimeSocket();
    disconnectRealtimeSocket();
    const b = getRealtimeSocket();
    expect(a).not.toBe(b);
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('getRealtimeSocket uses EXPO_PUBLIC_REALTIME_URL when set', () => {
    vi.stubEnv('EXPO_PUBLIC_REALTIME_URL', 'https://realtime.example.com');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith('https://realtime.example.com', expect.any(Object));
  });
  it('getRealtimeSocket uses API origin fallback', () => {
    delete process.env.EXPO_PUBLIC_REALTIME_URL;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    const url = vi.mocked(io).mock.calls.at(-1)?.[0] as string;
    expect(url).toContain('/realtime');
  });
  it('getRealtimeSocket respects custom socket path', () => {
    vi.stubEnv('EXPO_PUBLIC_SOCKET_IO_PATH', '/custom');
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/custom' }));
  });
  it('getRealtimeSocket default path /socket.io', () => {
    delete process.env.EXPO_PUBLIC_SOCKET_IO_PATH;
    disconnectRealtimeSocket();
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/socket.io' }));
  });
  it('getAuthRealtimeSocket reuses same token', () => {
    const a = getAuthRealtimeSocket('tok1');
    const b = getAuthRealtimeSocket('tok1');
    expect(a).toBe(b);
    expect(io).toHaveBeenCalledTimes(1);
  });
  it('getAuthRealtimeSocket creates new for different token', () => {
    const a = getAuthRealtimeSocket('tok1');
    const b = getAuthRealtimeSocket('tok2');
    expect(a).not.toBe(b);
    expect(io).toHaveBeenCalledTimes(2);
  });
  it('disconnectAuthRealtimeSocket clears', () => {
    const a = getAuthRealtimeSocket('tok1');
    disconnectAuthRealtimeSocket();
    const b = getAuthRealtimeSocket('tok1');
    expect(a).not.toBe(b);
  });
  it('getAuthRealtimeSocket passes auth token', () => {
    getAuthRealtimeSocket('myTok');
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ auth: { token: 'myTok' } }));
  });
  it('realtime sockets disconnect safely when null', () => {
    expect(() => disconnectRealtimeSocket()).not.toThrow();
    expect(() => disconnectAuthRealtimeSocket()).not.toThrow();
  });
  it('resolveListStatus idle/loading/empty/error', () => {
    expect(resolveListStatus({loading:true, error:null, itemCount:0})).toBe('loading');
    expect(resolveListStatus({loading:false, error:'boom', itemCount:0})).toBe('error');
    expect(resolveListStatus({loading:false, error:null, itemCount:0})).toBe('empty');
    expect(resolveListStatus({loading:false, error:null, itemCount:5})).toBe('idle');
  });
  it('resolveListStatus error takes precedence over empty', () => {
    expect(resolveListStatus({loading:false, error:'e', itemCount:0})).toBe('error');
  });
  it('theme brand and darkColors', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.text).toBe('#F8FAFC');
  });
  it('realtime transports include websocket and polling', () => {
    getRealtimeSocket();
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ transports: ['websocket','polling'] }));
  });
});
