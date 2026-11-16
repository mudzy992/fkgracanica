import { beforeEach, describe, expect, it, vi } from 'vitest';
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
vi.mock('react-native', () => ({ Vibration: { vibrate: vi.fn() }, Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('./api', () => ({ API_URL: 'https://api.fkgracanica.ba101.top/api/v1', api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) } }));
import { api } from './api';
import { loadClubPublic } from '../components/club/load-club-public';
import { loadHeritage, parseHeritageTab } from '../components/heritage/load-heritage';
const get = vi.mocked(api.get);
describe('mob-batch36 — P-MOB36 club-public/heritage', () => {
  beforeEach(() => { vi.clearAllMocks(); get.mockReset(); });
  it('parseHeritageTab fallback timeline', () => { expect(parseHeritageTab('sponsors')).toBe('sponsors'); expect(parseHeritageTab('bad')).toBe('timeline'); expect(parseHeritageTab(undefined)).toBe('timeline'); });
  it('loadHeritage mapira sve tabove', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/sponsors') return { data: [{ id: 's1', name: 'Sponzor1', tier: 'Gold' }] } as never;
      if (u === '/trophies') return { data: [{ id: 't1', title: 'Kup', year: 2020, featured: true }] } as never;
      if (u === '/club-timeline') return { data: [{ id: 'l1', title: 'Osnivanje', year: '1990', imagePath: '/a.jpg' }] } as never;
      if (u === '/hall-of-fame') return { data: [{ id: 'h1', name: 'Legenda', role: 'Trener' }] } as never;
      if (u === '/museum') return { data: [{ id: 'm1', name: 'Eksponat', description: 'Desc' }] } as never;
      return { data: [] } as never;
    });
    const r = await loadHeritage();
    expect(r.sponsors[0].title).toBe('Sponzor1'); expect(r.trophies[0].year).toBe(2020); expect(r.timeline[0].title).toBe('Osnivanje');
    expect(r.hall[0].role).toBe('Trener'); expect(r.museum[0].description).toBe('Desc');
  });
  it('loadHeritage imagePath fallback', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/sponsors') return { data: [{ id: 's1', name: 'A', logoPath: '/l.png' }] } as never;
      if (u === '/trophies') return { data: [{ id: 't1', name: 'B', photoPath: '/p.png' }] } as never;
      return { data: [] } as never;
    });
    const r = await loadHeritage();
    expect(r.sponsors[0].imagePath).toBe('/l.png'); expect(r.trophies[0].imagePath).toBe('/p.png');
  });
  it('loadClubPublic mapira club i stadium', async () => {
    get.mockResolvedValue({ data: { club: { id: 'c1', name: 'FKG', isOwnClub: true, crestPath: '/c.png', city: 'Gracanica' }, stadium: { name: 'Stadion', city: 'Gracanica', capacity: 1000 }, squad: { formation: { def: 4, mid: 4, fwd: 2 }, slots: [{ id: 's1', isBench: false, positionX: 10, positionY: 20, player: { id: 'p1', firstName: 'A', position: 'GK' } }] }, seasonStats: { season: { name: '2023' }, standing: { points: 5 }, totals: { goals: 10 }, players: [{ id: 'p1', stats: { goals: 1 } }] }, participations: [{ seasonId: 's1', competitionName: 'Liga', seasonName: '2023', yearStart: 2023, isLeague: true }], players: [] } } as never);
    const r = await loadClubPublic('fkg');
    expect(r.clubId).toBe('c1'); expect(r.isOwnClub).toBe(true); expect(r.stadium?.name).toBe('Stadion'); expect(r.formation).toBe('4-4-2'); expect(r.participations[0].label).toBe('Liga (2023)');
  });
  it('loadClubPublic fallback players i bez stadium', async () => {
    get.mockResolvedValue({ data: { club: { id: 'c1', name: 'Klub' }, squad: { slots: [] }, seasonStats: {}, players: [{ id: 'p2', firstName: 'B', position: 'DEF' }], participations: [{ seasonId: '' }], stadium: {} } } as never);
    const r = await loadClubPublic('slug');
    expect(r.players.length).toBe(1); expect(r.stadium).toBeUndefined(); expect(r.participations.length).toBe(0);
  });
  it('loadClubPublic pitchSlots i spotlight', async () => {
    get.mockResolvedValue({ data: { club: { id: 'c1', name: 'Klub' }, squad: { formation: {}, slots: [{ id: 's1', isBench: false, positionX: 30, positionY: 40, lineRole: 'MID', player: { id: 'p1', firstName: 'A', position: 'MID' } }] }, seasonStats: { players: [{ id: 'p1', stats: { goals: 2 } }] }, stadium: { name: 'S' }, participations: [] } } as never);
    const r = await loadClubPublic('s');
    expect(r.pitchSlots[0].left).toBe(40); expect(r.spotlight[0].id).toBe('p1');
  });
  it('loadClubPublic city/stadium fallback club', async () => {
    get.mockResolvedValue({ data: { club: { id: 'c1', name: 'K', city: 'Grad', stadium: 'Stad' }, squad: { slots: [] }, seasonStats: {}, stadium: {} } } as never);
    const r = await loadClubPublic('s');
    expect(r.city).toBe('Grad'); expect(r.stadiumName).toBe('Stad');
  });
  it('loadClubPublic capacity/ formation undefined', async () => {
    get.mockResolvedValue({ data: { club: { id: 'c1', name: 'K' }, squad: { formation: {} , slots: [] }, seasonStats: {}, stadium: { name: 'S', capacity: 'not-a-number' }, participations: [] } } as never);
    const r = await loadClubPublic('s');
    expect(r.stadium?.capacity).toBeUndefined(); expect(r.formation).toBeUndefined();
  });
  it('loadClubPublic totals/standing undefined', async () => {
    get.mockResolvedValue({ data: { club: { id: 'c1', name: 'K' }, squad: { slots: [] }, seasonStats: {} } } as never);
    const r = await loadClubPublic('s');
    expect(r.standing).toBeUndefined(); expect(r.totals).toBeUndefined();
  });
  it('loadClubPublic starters/bench', async () => {
    get.mockResolvedValue({ data: { club: { id: 'c1', name: 'K' }, squad: { slots: [{ isBench: false, player: { id: 'p1', firstName: 'A' } }, { isBench: true, player: { id: 'p2', firstName: 'B' } }] }, seasonStats: { players: [{ id: 'p1', stats: {} }, { id: 'p2', stats: {} }] } } } as never);
    const r = await loadClubPublic('s');
    expect(r.starters).toBe(1); expect(r.benchCount).toBe(1);
  });
  it('loadClubPublic isOwnClub false', async () => {
    get.mockResolvedValue({ data: { club: { id: 'c2', name: 'Drugi' }, squad: { slots: [] }, seasonStats: {} } } as never);
    const r = await loadClubPublic('drugi');
    expect(r.isOwnClub).toBe(false);
  });
});
