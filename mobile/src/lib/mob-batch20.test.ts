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

vi.mock('expo-linking', () => ({
  createURL: vi.fn(() => 'fkgracanica://payment-return'),
  parse: vi.fn(() => ({ queryParams: {} })),
}));

vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: vi.fn(async () => ({ type: 'dismiss' as const })),
}));

vi.mock('./api', () => ({
  API_URL: 'https://api.fkgracanica.ba101.top/api/v1',
  api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) },
}));

import { api } from './api';
import { emptyExtras, loadHomeExtras } from '../components/home/load-home-extras';
import { loadHomePlayers } from '../components/home/load-home-players';

const mockedGet = vi.mocked(api.get);
describe('mob-batch20 — P-MOB20 home loaders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGet.mockReset();
    mockedGet.mockResolvedValue({ data: null } as never);
  });
  it('emptyExtras ima prazne nizove', () => {
    expect(emptyExtras.players).toEqual([]);
    expect(emptyExtras.leagueRows).toEqual([]);
    expect(emptyExtras.gallery).toEqual([]);
    expect(emptyExtras.trophies).toEqual([]);
    expect(emptyExtras.sponsors).toEqual([]);
    expect(emptyExtras.timeline).toEqual([]);
    expect(emptyExtras.timelineSpan).toBeUndefined();
  });

  it('loadHomePlayers vraća [] kad nema clubId', async () => {
    mockedGet.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: {} } as never;
      if (url === '/seasons') return { data: [] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res).toEqual([]);
  });

  it('loadHomePlayers ranked sortirano po golovima pa prezimenu limit 5', async () => {
    const seasons = [{ id: 'cal1', name: '2024/25', isActive: true, competitions: [{ id: 'ed1', competition: { name: 'Liga', isLeague: true } }] }];
    mockedGet.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'club1' } } as never;
      if (url === '/seasons') return { data: seasons } as never;
      if (url === '/clubs/club1/stats') return { data: { players: [{ id: 'p1', firstName: 'A', lastName: 'Z', stats: { goals: 5 } }, { id: 'p2', firstName: 'B', lastName: 'A', stats: { goals: 5 } }, { id: 'p3', firstName: 'C', lastName: 'M', stats: { goals: 10 } }] } } as never;
      if (url === '/players') return { data: [] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res.length).toBe(3);
    expect(res[0].id).toBe('p3');
    expect(res[0].goals).toBe(10);
    expect(res[1].lastName).toBe('A');
    expect(res[2].lastName).toBe('Z');
  });

  it('loadHomePlayers fallback na players kad nema ranked', async () => {
    const seasons = [{ id: 'cal1', name: 'S', isActive: true, competitions: [{ id: 'ed1', competition: { name: 'Liga', isLeague: true } }] }];
    mockedGet.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: seasons } as never;
      if (url === '/clubs/c1/stats') return { data: { players: [] } } as never;
      if (url === '/players') return { data: [{ id: 'p1', firstName: 'Ime', lastName: 'Prez', number: 7, position: 'FWD' }, { id: 'p2', firstName: '', lastName: '', position: '' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res.length).toBe(2);
    expect(res[0].id).toBe('p1');
    expect(res[0].number).toBe(7);
    expect(res[1].firstName).toBe('Igrač');
  });

  it('loadHomePlayers photoById mapira photoPath', async () => {
    const seasons = [{ id: 'cal1', name: 'S', isActive: true, competitions: [{ id: 'ed1', competition: { name: 'Liga', isLeague: true } }] }];
    mockedGet.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: seasons } as never;
      if (url === '/clubs/c1/stats') return { data: { players: [{ id: 'p1', firstName: 'A', lastName: 'B', stats: { goals: 2 } }] } } as never;
      if (url === '/players') return { data: [{ id: 'p1', photoPath: '/photo.jpg' }, { id: 'p2', imagePath: '/img2.jpg' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res.find((p) => p.id === 'p1')?.photoPath).toBe('/photo.jpg');
  });

  it('loadHomePlayers number/goals edge', async () => {
    const seasons = [{ id: 'cal1', name: 'S', isActive: true, competitions: [{ id: 'ed1', competition: { name: 'Liga', isLeague: true } }] }];
    mockedGet.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: seasons } as never;
      if (url === '/clubs/c1/stats') return { data: { players: [{ id: 'p1', firstName: 'A', lastName: 'B', number: '0', goals: 3, stats: {} }, { id: 'p2', firstName: 'C', lastName: 'D', number: '-5', position: 'GK' }] } } as never;
      if (url === '/players') return { data: [] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res.find((p) => p.id === 'p1')?.number).toBeUndefined();
    expect(res.find((p) => p.id === 'p2')?.number).toBeUndefined();
    expect(res.find((p) => p.id === 'p1')?.goals).toBe(3);
  });

  it('loadHomePlayers seasonId prazan ne zove stats sa seasonId', async () => {
    const seasons: unknown[] = [];
    mockedGet.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: seasons } as never;
      if (url === '/players') return { data: [{ id: 'p1', firstName: 'A', lastName: 'B' }] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res.length).toBe(1);
    expect(mockedGet).toHaveBeenCalledWith('/players', expect.anything());
  });

  it('loadHomePlayers goals fallback na player.goals', async () => {
    const seasons = [{ id: 'cal1', name: 'S', isActive: true, competitions: [{ id: 'ed1', competition: { name: 'Liga', isLeague: true } }] }];
    mockedGet.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: seasons } as never;
      if (url === '/clubs/c1/stats') return { data: { players: [{ id: 'p1', firstName: 'A', lastName: 'B', goals: 4 }] } } as never;
      if (url === '/players') return { data: [] } as never;
      return { data: null } as never;
    });
    const res = await loadHomePlayers();
    expect(res[0].goals).toBe(4);
  });

  it('loadHomeExtras vraća empty kad api baci', async () => {
    mockedGet.mockRejectedValue(new Error('net'));
    const res = await loadHomeExtras();
    expect(res.players).toEqual([]);
    expect(res.leagueRows).toEqual([]);
    expect(res.gallery).toEqual([]);
    expect(res.trophies).toEqual([]);
    expect(res.sponsors).toEqual([]);
    expect(res.timeline).toEqual([]);
  });

  it('loadHomeExtras agregira gallery/trophies/sponsors sa mockom', async () => {
    mockedGet.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: [] } as never;
      if (url === '/players') return { data: [] } as never;
      if (url === '/gallery') return { data: [{ id: 'g1', slug: 'g1', title: 'Galerija', photos: [{ path: '/a.jpg' }], photoCount: 1 }] } as never;
      if (url === '/trophies') return { data: [{ id: 't1', name: 'Kup', year: '2020' }] } as never;
      if (url === '/sponsors') return { data: [{ id: 's1', name: 'Sponzor' }] } as never;
      if (url === '/club-timeline') return { data: [{ id: 'tl1', year: 2020, title: 'T', imagePath: '/img.jpg' }] } as never;
      if (url === '/statistics/standings') return { data: [] } as never;
      return { data: [] } as never;
    });
    const res = await loadHomeExtras();
    expect(res.gallery.length).toBe(1);
    expect(res.gallery[0].id).toBe('g1');
    expect(res.trophies.length).toBe(1);
    expect(res.sponsors.length).toBe(1);
    expect(res.timeline.length).toBe(1);
  });

  it('loadHomeExtras players delegira na loadHomePlayers', async () => {
    const seasons = [{ id: 'cal1', name: 'S', isActive: true, competitions: [{ id: 'ed1', competition: { name: 'Liga', isLeague: true } }] }];
    mockedGet.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (url === '/seasons') return { data: seasons } as never;
      if (url === '/clubs/c1/stats') return { data: { players: [{ id: 'p1', firstName: 'A', lastName: 'B', stats: { goals: 1 } }] } } as never;
      if (url === '/players') return { data: [{ id: 'p1', photoPath: '/p.jpg' }] } as never;
      if (url === '/gallery') return { data: [] } as never;
      if (url === '/trophies') return { data: [] } as never;
      if (url === '/sponsors') return { data: [] } as never;
      if (url === '/club-timeline') return { data: [] } as never;
      if (url === '/statistics/standings') return { data: [] } as never;
      return { data: [] } as never;
    });
    const res = await loadHomeExtras();
    expect(res.players.length).toBe(1);
    expect(res.players[0].id).toBe('p1');
  });
});
