import { afterEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ token: null as string | null }));
const ioMock = vi.hoisted(() => vi.fn());

vi.mock('socket.io-client', () => ({ io: ioMock }));
vi.mock('./api', () => ({ getAccessToken: () => state.token }));

const load = async () => {
  vi.resetModules();
  return import('./realtime');
};

afterEach(() => {
  vi.unstubAllEnvs();
  ioMock.mockReset();
  state.token = null;
});

describe('realtime URL-ovi', () => {
  it('bez env varijabli koristi lokalni API origin', async () => {
    const mod = await load();
    expect(mod.resolveRealtimeUrl()).toBe('http://localhost:3000/realtime');
    expect(mod.resolveSocketPath()).toBe('/socket.io');
  });

  it('VITE_REALTIME_URL ima prednost', async () => {
    vi.stubEnv('VITE_REALTIME_URL', 'https://rt.example.com/realtime');
    const mod = await load();
    expect(mod.resolveRealtimeUrl()).toBe('https://rt.example.com/realtime');
  });

  it('VITE_SOCKET_IO_PATH ima prednost', async () => {
    vi.stubEnv('VITE_SOCKET_IO_PATH', '/custom/socket.io');
    const mod = await load();
    expect(mod.resolveSocketPath()).toBe('/custom/socket.io');
  });

  it('backend prefiks se skida za realtime i dodaje za socket path', async () => {
    vi.stubEnv('VITE_API_URL', 'https://fkgracanica.ba/backend/api/v1');
    const mod = await load();
    expect(mod.resolveRealtimeUrl()).toBe('https://fkgracanica.ba/realtime');
    expect(mod.resolveSocketPath()).toBe('/backend/socket.io');
  });

  it('produkcijski API origin bez /backend koristi /socket.io', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.fkgracanica.ba/api/v1');
    const mod = await load();
    expect(mod.resolveRealtimeUrl()).toBe('https://api.fkgracanica.ba/realtime');
    expect(mod.resolveSocketPath()).toBe('/socket.io');
  });
});

describe('getRealtimeSocket', () => {
  it('kreirac socket jednom i prosljeđuje token', async () => {
    state.token = 'jwt-123';
    const fake = { disconnect: vi.fn() };
    ioMock.mockReturnValue(fake);
    const mod = await load();

    const first = mod.getRealtimeSocket();
    const second = mod.getRealtimeSocket();

    expect(first).toBe(fake);
    expect(second).toBe(fake);
    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock).toHaveBeenCalledWith('http://localhost:3000/realtime', {
      path: '/socket.io',
      auth: { token: 'jwt-123' },
      transports: ['websocket', 'polling'],
    });
  });

  it('bez tokena šalje prazan auth objekat', async () => {
    ioMock.mockReturnValue({ disconnect: vi.fn() });
    const mod = await load();
    mod.getRealtimeSocket();
    expect(ioMock).toHaveBeenCalledWith(
      'http://localhost:3000/realtime',
      expect.objectContaining({ auth: {} }),
    );
  });

  it('disconnect zatvara socket i sljedeći poziv pravi novi', async () => {
    const firstFake = { disconnect: vi.fn() };
    const secondFake = { disconnect: vi.fn() };
    ioMock.mockReturnValueOnce(firstFake).mockReturnValueOnce(secondFake);
    const mod = await load();

    mod.getRealtimeSocket();
    mod.disconnectRealtimeSocket();
    expect(firstFake.disconnect).toHaveBeenCalledTimes(1);

    expect(mod.getRealtimeSocket()).toBe(secondFake);
    expect(ioMock).toHaveBeenCalledTimes(2);
  });
});
