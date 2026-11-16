import { beforeEach, describe, expect, it, vi } from 'vitest';
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
vi.mock('react-native', () => ({ Vibration: { vibrate: vi.fn() }, Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('./api', () => ({ API_URL: 'https://api.fkgracanica.ba101.top/api/v1', api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) } }));
import { api } from './api';
import { loadLeagueScreen, mapLeagueMatches } from '../components/league/load-league-screen';
import { mapStandingsRows } from '../components/league/map-standings';
import { mapLeaders, mapRounds, roundsPlayed } from '../components/league/map-league-lists';
const get = vi.mocked(api.get);
describe('mob-batch33 — P-MOB33 load-league-screen', () => {
  beforeEach(() => { vi.clearAllMocks(); get.mockReset(); get.mockResolvedValue({ data: null } as never); });
  it('mapLeagueMatches live/finished/scheduled meta', () => {
    const r = mapLeagueMatches([
      { id: 'm1', status: 'LIVE', homeScore: 1, awayScore: 2, minute: 33, homeClub: { name: 'A' }, awayClub: { name: 'B' } },
      { id: 'm2', status: 'FINISHED', homeScore: 0, awayScore: 0, homeClub: {}, awayClub: {} },
      { id: 'm3', status: 'SCHEDULED', scheduledAt: '2026-01-01', homeClub: {}, awayClub: {} },
    ]);
    expect(r[0].meta).toBe('1 : 2 · 33\''); expect(r[0].status).toBe('LIVE');
    expect(r[1].meta).toBe('0 : 0'); expect(r[2].meta).toBe('2026-01-01');
  });
  it('mapLeagueMatches fallback id/name/crest', () => {
    const r = mapLeagueMatches([{ homeClub: {}, awayClub: {}, status: '' } as any]);
    expect(r[0].id).toBe('0'); expect(r[0].homeName).toBe('Domaći'); expect(r[0].awayName).toBe('Gosti');
    expect(r[0].homeCrestPath).toBeUndefined();
  });
  it('mapStandingsRows isOwn/isHighlight/position', () => {
    const r = mapStandingsRows([{ clubId: 'c1', clubName: 'A', points: 10 }, { clubId: 'c2' } as any], { ownId: 'c1', highlightId: 'c2' });
    expect(r[0].position).toBe(1); expect(r[0].isOwn).toBe(true); expect(r[0].isHighlight).toBe(false);
    expect(r[1].isHighlight).toBe(true); expect(r[1].clubName).toBe('Tim 2');
  });
  it('mapStandingsRows highlight fallback isOwn', () => {
    const r = mapStandingsRows([{ clubId: 'c1' } as any], { ownId: 'c1' });
    expect(r[0].isHighlight).toBe(true);
  });
  it('mapLeaders slice 8 i filter bez playerId', () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({ playerId: i < 9 ? `p${i}` : '', firstName: 'A', lastName: 'B', value: i }));
    const r = mapLeaders(rows);
    expect(r.length).toBe(8); expect(r[0].name).toBe('A B'); expect(r[0].value).toBe(0);
  });
  it('mapRounds filter i sort', () => {
    const r = mapRounds([{ id: 'r2', number: 2, name: 'R2' }, { id: '', number: 5 }, { id: 'r1', number: 1 }, { id: 'r0', number: 0 }] as any);
    expect(r.map((x) => x.number)).toEqual([1, 2]); expect(r[0].id).toBe('r1');
  });
  it('roundsPlayed max FINISHED', () => {
    expect(roundsPlayed([{ status: 'FINISHED', roundRel: { number: 3 } }, { status: 'LIVE', roundRel: { number: 5 } }, { status: 'FINISHED', roundRel: { number: 2 } }] as any)).toBe(3);
    expect(roundsPlayed([])).toBe(0);
  });
  it('loadLeagueScreen empty kad nema edition', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/seasons') return { data: [{ id: 's1', name: 'S1', isActive: true, competitions: [] }] } as never;
      if (u === '/clubs/own') return { data: { id: 'c1' } } as never;
      return { data: [] } as never;
    });
    const r = await loadLeagueScreen();
    expect(r.seasons.length).toBe(1); expect(r.editionId).toBe(''); expect(r.standings).toEqual([]);
  });
  it('loadLeagueScreen mapira standings/matches/leaders i leader', async () => {
    get.mockImplementation(async (u: string, o?: any) => {
      if (u === '/seasons') return { data: [{ id: 's1', name: 'S1', isActive: true, competitions: [{ id: 'e1', competition: { name: 'Liga', isLeague: true } }] }] } as never;
      if (u === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (u === '/statistics/standings') return { data: [{ clubId: 'c1', clubName: 'A', points: 9, crestPath: '/a.png' }] } as never;
      if (u === '/matches') return { data: [{ id: 'm1', status: 'FINISHED', homeScore: 1, awayScore: 0, homeClub: { name: 'A' }, awayClub: { name: 'B' }, roundRel: { number: 2 } }] } as never;
      if (u === '/statistics/top-scorers') return { data: [{ playerId: 'p1', firstName: 'Edin', lastName: 'Dž', value: 5 }] } as never;
      if (u === '/statistics/top-assists') return { data: [] } as never;
      if (u === '/rounds') return { data: [{ id: 'r1', number: 1, name: '1. kolo' }] } as never;
      return { data: [] } as never;
    });
    const r = await loadLeagueScreen('s1');
    expect(r.seasonId).toBe('s1'); expect(r.editionId).toBe('e1'); expect(r.standings[0].clubName).toBe('A');
    expect(r.matches.length).toBe(1); expect(r.scorers[0].playerId).toBe('p1');
    expect(r.leaderName).toBe('A'); expect(r.leaderPoints).toBe(9); expect(r.teamCount).toBe(1); expect(r.roundsPlayed).toBe(2);
  });
  it('loadLeagueScreen upToRound i rounds catch', async () => {
    let captured: any = null;
    get.mockImplementation(async (u: string, o?: any) => {
      if (u === '/seasons') return { data: [{ id: 's1', name: 'S1', isActive: true, competitions: [{ id: 'e1', competition: { name: 'Liga', isLeague: true } }] }] } as never;
      if (u === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (u === '/statistics/standings') { captured = o?.params; return { data: [] } as never; }
      if (u === '/rounds') throw new Error('fail rounds');
      if (u === '/matches' || u.includes('top-')) return { data: [] } as never;
      return { data: [] } as never;
    });
    const r = await loadLeagueScreen(undefined, 5);
    expect(captured).toEqual({ seasonId: 'e1', upToRound: 5 }); expect(r.rounds).toEqual([]);
  });
  it('loadLeagueScreen bira selected season/edition', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/seasons') return { data: [{ id: 's1', name: 'S1', isActive: true, competitions: [{ id: 'e1', competition: { name: 'A', isLeague: true } }, { id: 'e2', competition: { name: 'Kup' } }] }, { id: 's2', name: 'S2', competitions: [{ id: 'e3', competition: { name: 'Liga', isLeague: true } }] }] } as never;
      if (u === '/clubs/own') return { data: { id: 'c1' } } as never;
      if (u.includes('standings') || u === '/matches' || u.includes('top-') || u === '/rounds') return { data: [] } as never;
      return { data: [] } as never;
    });
    const r = await loadLeagueScreen('s1', null, 'e2');
    expect(r.seasonId).toBe('s1'); expect(r.editionId).toBe('e2');
    const r2 = await loadLeagueScreen('s2', null, 'e2');
    expect(r2.editionId).toBe('e3');
  });
});
