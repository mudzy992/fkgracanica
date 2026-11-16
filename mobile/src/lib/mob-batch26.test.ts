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

vi.mock('../lib/api', () => ({
  API_URL: 'https://api.fkgracanica.ba101.top/api/v1',
  api: { get: vi.fn(async () => ({ data: [] })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) },
}));

import { api } from '../lib/api';
import { loadHeritage, parseHeritageTab } from '../components/heritage/load-heritage';

const get = vi.mocked(api.get);

describe('mob-batch26 — P-MOB26 load-heritage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockReset();
    get.mockResolvedValue({ data: [] } as never);
  });

  it('parseHeritageTab valid i fallback', () => {
    expect(parseHeritageTab('sponsors')).toBe('sponsors');
    expect(parseHeritageTab('trophies')).toBe('trophies');
    expect(parseHeritageTab('nepoznato')).toBe('timeline');
    expect(parseHeritageTab(undefined)).toBe('timeline');
    expect(parseHeritageTab('museum')).toBe('museum');
  });

  it('loadHeritage prazno', async () => {
    get.mockResolvedValue({ data: [] } as never);
    const data = await loadHeritage();
    expect(data.sponsors).toEqual([]);
    expect(data.trophies).toEqual([]);
    expect(data.timeline).toEqual([]);
    expect(data.hall).toEqual([]);
    expect(data.museum).toEqual([]);
  });

  it('loadHeritage mapira sponsors name', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/sponsors') return { data: [{ id: 's1', name: 'Sponzor A', tier: 'GOLD', logoPath: '/logo.png' }] } as never;
      return { data: [] } as never;
    });
    const data = await loadHeritage();
    expect(data.sponsors[0].id).toBe('s1');
    expect(data.sponsors[0].title).toBe('Sponzor A');
    expect(data.sponsors[0].tier).toBe('GOLD');
    expect(data.sponsors[0].imagePath).toBe('/logo.png');
  });

  it('loadHeritage mapira trophies name/title fallback', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/trophies') return { data: [{ id: 't1', title: 'Kup' }] } as never;
      return { data: [] } as never;
    });
    const data = await loadHeritage();
    expect(data.trophies[0].title).toBe('Kup');
  });

  it('loadHeritage mapira timeline title', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/club-timeline') return { data: [{ id: '1', title: '1920 Osnivanje', year: 1920 }] } as never;
      return { data: [] } as never;
    });
    const data = await loadHeritage();
    expect(data.timeline[0].year).toBe(1920);
    expect(data.timeline[0].title).toBe('1920 Osnivanje');
  });

  it('loadHeritage mapira hall name i museum title/name', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/hall-of-fame') return { data: [{ id: 'h1', name: 'Igrač', years: '2020', photoPath: '/p.jpg' }] } as never;
      if (url === '/museum') return { data: [{ id: 'm1', name: 'Eksponat', imagePath: '/img.jpg' }] } as never;
      return { data: [] } as never;
    });
    const data = await loadHeritage();
    expect(data.hall[0].title).toBe('Igrač');
    expect(data.hall[0].subtitle).toBe('2020');
    expect(data.hall[0].imagePath).toBe('/p.jpg');
    expect(data.museum[0].title).toBe('Eksponat');
  });

  it('loadHeritage subtitle tier/role/years/category', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/sponsors') return { data: [{ id: '1', name: 'A', tier: 'GOLD' }] } as never;
      if (url === '/hall-of-fame') return { data: [{ id: '2', name: 'B', role: 'Trener' }] } as never;
      if (url === '/museum') return { data: [{ id: '3', title: 'C', category: 'photo' }] } as never;
      return { data: [] } as never;
    });
    const data = await loadHeritage();
    expect(data.sponsors[0].subtitle).toBe('GOLD');
    expect(data.hall[0].subtitle).toBe('Trener');
    expect(data.museum[0].subtitle).toBe('photo');
  });

  it('loadHeritage id fallback i featured', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/sponsors') return { data: [{ name: 'Bez ID', featured: true }] } as never;
      return { data: [] } as never;
    });
    const data = await loadHeritage();
    expect(data.sponsors[0].id).toBe('0');
    expect(data.sponsors[0].featured).toBe(true);
  });

  it('loadHeritage title fallback —', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/sponsors') return { data: [{ id: '1' }] } as never;
      return { data: [] } as never;
    });
    const data = await loadHeritage();
    expect(data.sponsors[0].title).toBe('—');
  });

  it('loadHeritage year parsed i featured false', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/museum') return { data: [{ id: '1', title: 'T', year: '2021', description: 'bio' }] } as never;
      return { data: [] } as never;
    });
    const data = await loadHeritage();
    expect(data.museum[0].year).toBe(2021);
    expect(data.museum[0].description).toBe('bio');
    expect(data.museum[0].featured).toBe(false);
  });

  it('loadHeritage asArray non-array', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/sponsors') return { data: null } as never;
      if (url === '/trophies') return { data: { id: '1', name: 'X' } } as never;
      return { data: [] } as never;
    });
    const data = await loadHeritage();
    expect(data.sponsors).toEqual([]);
    expect(data.trophies.length).toBe(0);
  });
});
