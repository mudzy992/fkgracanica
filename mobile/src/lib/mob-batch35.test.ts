import { beforeEach, describe, expect, it, vi } from 'vitest';
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
vi.mock('react-native', () => ({ Vibration: { vibrate: vi.fn() }, Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('./api', () => ({ API_URL: 'https://api.fkgracanica.ba101.top/api/v1', api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) } }));
import { api } from './api';
import { groupTeamPlayers, loadTeamScreen } from '../components/team/load-team-screen';
const get = vi.mocked(api.get);
describe('mob-batch35 — P-MOB35 load-team-screen', () => {
  beforeEach(() => { vi.clearAllMocks(); get.mockReset(); });
  it('groupTeamPlayers filtrira bench i prazne', () => {
    const r = groupTeamPlayers([{ id: '1', position: 'GK', isBench: false } as any, { id: '2', position: 'GK', isBench: true } as any, { id: '3', position: 'FWD', isBench: false } as any]);
    expect(r.length).toBe(2); expect(r[0].position).toBe('GK'); expect(r[1].position).toBe('FWD');
  });
  it('loadTeamScreen throw bez clubId', async () => {
    get.mockImplementation(async (u: string) => { if (u === '/clubs/own') return { data: { name: 'X' } } as never; return { data: null } as never; });
    await expect(loadTeamScreen()).rejects.toThrow('no-club');
  });
  it('loadTeamScreen mapira igrače i stats', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') return { data: { id: 'c1', name: 'FKG', crestPath: '/c.png', stadiumRel: { name: 'Stadion', city: 'Gračanica' } } } as never;
      if (u === '/clubs/c1/squad') return { data: { formation: { def: 4, mid: 3, fwd: 3 }, slots: [{ id: 's1', isBench: false, positionX: 10, positionY: 20, lineRole: 'GK', player: { id: 'p1', firstName: 'A', lastName: 'B', position: 'GK', number: 1, photoPath: '/p.jpg' } }, { id: 's2', isBench: true, player: { id: 'p2', firstName: 'C', position: 'DEF' } }] } } as never;
      if (u === '/clubs/c1/stats') return { data: { season: { name: '2023/24' }, standing: { points: 9, played: 3 }, totals: { goals: 5, appearances: 3 }, players: [{ id: 'p1', stats: { goals: 2, assists: 1 } }] } } as never;
      return { data: [] } as never;
    });
    const r = await loadTeamScreen();
    expect(r.clubId).toBe('c1'); expect(r.formation).toBe('4-3-3'); expect(r.starters).toBe(1); expect(r.benchCount).toBe(1);
    expect(r.standing?.points).toBe(9); expect(r.totals?.goals).toBe(5); expect(r.players[0].goals).toBe(2);
    expect(r.pitchSlots.length).toBe(1); expect(r.spotlight.length).toBe(1);
  });
  it('loadTeamScreen spotlight sort i slice', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') return { data: { id: 'c1', name: 'FKG' } } as never;
      if (u === '/clubs/c1/squad') return { data: { slots: [{ isBench: false, player: { id: 'p1', firstName: 'A', position: 'FWD' } }, { isBench: false, player: { id: 'p2', firstName: 'B', position: 'FWD' } }, { isBench: false, player: { id: 'p3', firstName: 'C', position: 'FWD' } }, { isBench: false, player: { id: 'p4', firstName: 'D', position: 'FWD' } }] } } as never;
      if (u === '/clubs/c1/stats') return { data: { players: [{ id: 'p1', stats: { goals: 3 } }, { id: 'p2', stats: { goals: 3, assists: 1 } }, { id: 'p3', stats: { goals: 1 } }, { id: 'p4', stats: { goals: 0 } }] } } as never;
      return { data: [] } as never;
    });
    const r = await loadTeamScreen();
    expect(r.spotlight.length).toBe(3); expect(r.spotlight[0].id).toBe('p2');
  });
  it('loadTeamScreen fallback logoPath/city/stadium', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') return { data: { id: 'c1', name: 'FKG', logoPath: '/logo.png', city: 'Grad', stadium: 'Stad' } } as never;
      if (u === '/clubs/c1/squad') return { data: { slots: [] } } as never;
      if (u === '/clubs/c1/stats') return { data: {} } as never;
      if (u === '/players') return { data: [{ id: 'p1', firstName: 'X', position: 'MID' }] } as never;
      return { data: null } as never;
    });
    const r = await loadTeamScreen();
    expect(r.crestPath).toBe('/logo.png'); expect(r.city).toBe('Grad'); expect(r.stadiumName).toBe('Stad'); expect(r.formation).toBeUndefined();
  });
  it('loadTeamScreen pitchSlots mapPitch', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') return { data: { id: 'c1', name: 'FKG' } } as never;
      if (u === '/clubs/c1/squad') return { data: { slots: [{ id: 's1', isBench: false, positionX: 30, positionY: 40, lineRole: 'DEF', player: { id: 'p1', firstName: 'A' } }] } } as never;
      if (u === '/clubs/c1/stats') return { data: { players: [{ id: 'p1', stats: {} }] } } as never;
      return { data: [] } as never;
    });
    const r = await loadTeamScreen();
    expect(r.pitchSlots[0].left).toBe(40); expect(r.pitchSlots[0].top).toBe(70); expect(r.pitchSlots[0].lineRole).toBe('DEF');
  });
  it('loadTeamScreen bez squad koristi /players fallback', async () => {
    get.mockImplementation(async (u: string, o?: any) => {
      if (u === '/clubs/own') return { data: { id: 'c1', name: 'FKG' } } as never;
      if (u === '/clubs/c1/squad') return { data: { slots: [] } } as never;
      if (u === '/clubs/c1/stats') return { data: {} } as never;
      if (u === '/players') { expect(o?.params).toEqual({ clubId: 'c1', activeOnly: 'true' }); return { data: [{ id: 'p9', firstName: 'Z', position: 'MID' }] } as never; }
      return { data: [] } as never;
    });
    const r = await loadTeamScreen();
    expect(r.players.length).toBe(1); expect(r.players[0].id).toBe('p9');
  });
  it('loadTeamScreen stats catch vraća bez standing', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') return { data: { id: 'c1', name: 'FKG' } } as never;
      if (u === '/clubs/c1/squad') return { data: { slots: [{ isBench: false, player: { id: 'p1', firstName: 'A' } }] } } as never;
      if (u === '/clubs/c1/stats') throw new Error('fail');
      return { data: [] } as never;
    });
    const r = await loadTeamScreen();
    expect(r.standing).toBeUndefined(); expect(r.totals).toBeUndefined();
  });
  it('mapPlayer number/photo fallback', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') return { data: { id: 'c1', name: 'FKG' } } as never;
      if (u === '/clubs/c1/squad') return { data: { slots: [{ isBench: false, player: { id: 'p1', number: 0, imagePath: '/img.jpg', position: 'MID' } }, { isBench: false, player: { id: 'p2', number: 10 } }] } } as never;
      if (u === '/clubs/c1/stats') return { data: { players: [{ id: 'p1', stats: {} }, { id: 'p2', stats: {} }] } } as never;
      return { data: [] } as never;
    });
    const r = await loadTeamScreen();
    expect(r.players.find((p) => p.id === 'p1')?.number).toBeUndefined(); expect(r.players.find((p) => p.id === 'p1')?.photoPath).toBe('/img.jpg');
    expect(r.players.find((p) => p.id === 'p2')?.number).toBe(10);
  });
  it('pitchSlots filter bench i player null', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') return { data: { id: 'c1', name: 'FKG' } } as never;
      if (u === '/clubs/c1/squad') return { data: { slots: [{ id: 's1', isBench: true, player: { id: 'p1' } }, { id: 's2', isBench: false, player: {} }] } } as never;
      if (u === '/clubs/c1/stats') return { data: { players: [{ id: 'p1', stats: {} }] } } as never;
      return { data: [] } as never;
    });
    const r = await loadTeamScreen();
    expect(r.pitchSlots.length).toBe(1); expect(r.pitchSlots[0].player).toBeNull();
  });
  it('clubName fallback FK Gračanica', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (u === '/clubs/c1/squad') return { data: { slots: [] } } as never;
      if (u === '/clubs/c1/stats') return { data: {} } as never;
      if (u === '/players') return { data: [] } as never;
      return { data: [] } as never;
    });
    expect((await loadTeamScreen()).clubName).toBe('FK Gračanica');
  });
});
