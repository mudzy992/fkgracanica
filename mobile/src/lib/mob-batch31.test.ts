import { beforeEach, describe, expect, it, vi } from 'vitest';

(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;

vi.mock('react-native', () => ({
  Vibration: { vibrate: vi.fn() },
  Platform: { OS: 'ios' as const },
  Linking: { openURL: vi.fn(async () => {}) },
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

vi.mock('./api', () => ({
  API_URL: 'https://api.fkgracanica.ba101.top/api/v1',
  api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) },
}));

import { api } from './api';
import { loadHomePlayers } from '../components/home/load-home-players';

const get = vi.mocked(api.get);

describe('mob-batch31 — P-MOB31 load-home-players', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockReset();
    get.mockResolvedValue({ data: null } as never);
  });

  it('vraća prazno bez clubId', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: {} } as never;
      if (url === '/seasons') return { data: [] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res).toEqual([]);
  });

  it('vraća players slice kad nema stats', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [] } as never;
      if (url === '/players') return { data: [{ id: 'p1', firstName: 'A', lastName: 'B', number: 9, position: 'FWD' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('p1');
    expect(res[0].firstName).toBe('A');
    expect(res[0].goals).toBe(0);
  });

  it('mapira ranked iz stats', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [{ id: 'cal1', name: '2024/25', competitions: [{ id: 'ed1', competition: { name: 'Liga' }, isLeague: true }] }] } as never;
      if (url.includes('/clubs/c1/stats')) return { data: { players: [{ id: 'p1', firstName: 'Z', lastName: 'A', stats: { goals: 5 } }, { id: 'p2', firstName: 'A', lastName: 'B', stats: { goals: 10 } }] } } as never;
      if (url === '/players') return { data: [{ id: 'p1', photoPath: '/p1.jpg' }, { id: 'p2', photoPath: '/p2.jpg' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res.length).toBe(2);
    expect(res[0].id).toBe('p2');
    expect(res[0].goals).toBe(10);
    expect(res[0].photoPath).toBe('/p2.jpg');
  });

  it('photoById iz playersRes', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [] } as never;
      if (url === '/players') return { data: [{ id: 'p1', imagePath: '/img.jpg' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res[0].photoPath).toBe('/img.jpg');
  });

  it('number i position fallback', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [] } as never;
      if (url === '/players') return { data: [{ id: 'p1', firstName: 'Ime' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res[0].position).toBe('Tim');
    expect(res[0].number).toBeUndefined();
    expect(res[0].firstName).toBe('Ime');
  });

  it('firstName fallback Igrač', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [] } as never;
      if (url === '/players') return { data: [{ id: 'p1', name: 'Fallback' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    // name fallback not used for firstName? it uses firstName || name with default 'Igrač' - check
    expect(res[0].firstName).toBe('Fallback');
  });

  it('goals iz player.goals fallback', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [] } as never;
      if (url === '/players') return { data: [{ id: 'p1', firstName: 'A', goals: 3 }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res[0].goals).toBe(3);
  });

  it('slice 5 limit', async () => {
    const players = Array.from({ length: 10 }, (_, i) => ({ id: `p${i}`, firstName: `A${i}` }));
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [] } as never;
      if (url === '/players') return { data: players } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res.length).toBe(5);
  });

  it('ranked sort po lastName kad isti goals', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [{ id: 'cal1', competitions: [{ id: 'ed1', competition: { name: 'Liga' } }] }] } as never;
      if (url.includes('/stats')) return { data: { players: [{ id: 'p1', firstName: 'A', lastName: 'Z', stats: { goals: 5 } }, { id: 'p2', firstName: 'B', lastName: 'A', stats: { goals: 5 } }] } } as never;
      if (url === '/players') return { data: [] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res[0].lastName).toBe('A');
  });

  it('number validan', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [] } as never;
      if (url === '/players') return { data: [{ id: 'p1', firstName: 'A', number: '10' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res[0].number).toBe(10);
  });

  it('number nevažeći 0 ili NaN', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [] } as never;
      if (url === '/players') return { data: [{ id: 'p1', firstName: 'A', number: 0 }, { id: 'p2', firstName: 'B', number: 'abc' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res[0].number).toBeUndefined();
    expect(res[1].number).toBeUndefined();
  });
});
