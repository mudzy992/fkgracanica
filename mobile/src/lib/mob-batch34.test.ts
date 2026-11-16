import { beforeEach, describe, expect, it, vi } from 'vitest';
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
vi.mock('react-native', () => ({ Vibration: { vibrate: vi.fn() }, Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('./api', () => ({ API_URL: 'https://api.fkgracanica.ba101.top/api/v1', api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) } }));
import { api } from './api';
import { fetchNewsDetail, mapNewsDetail } from '../components/news/load-news-detail';
import { loadClubCompetition } from '../components/club/load-club-competition';
import { loadClubParticipations, loadClubSeasonStats, mapParticipations, mapTeamSeasonStats } from '../components/team/load-team-stats';
const get = vi.mocked(api.get);
describe('mob-batch34 — P-MOB34 news/team/club', () => {
  beforeEach(() => { vi.clearAllMocks(); get.mockReset(); get.mockResolvedValue({ data: null } as never); });
  it('mapNewsDetail photos path/imagePath', () => {
    const r = mapNewsDetail({ id: 'n1', title: 'T', category: { id: 'c1', name: 'Cat' }, gallery: { photos: [{ id: 'p1', imagePath: '/a.jpg' }] }, relatedMatches: [], relatedPlayers: [] });
    expect(r.photos[0].path).toBe('/a.jpg'); expect(r.category?.name).toBe('Cat');
    const r2 = mapNewsDetail({ id: 'n2', title: 'T2', gallery: [{ id: 'p2', path: '/b.jpg' }] } as any);
    expect(r2.photos[0].path).toBe('/b.jpg');
  });
  it('mapNewsDetail matches flatMap', () => {
    const r = mapNewsDetail({ id: 'n1', title: 'T', relatedMatches: [{ match: { id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } } }, { matchId: 'm2' }, { match: {} }] } as any);
    expect(r.relatedMatches.map((x) => x.id)).toEqual(['m1', 'm2']); expect(r.relatedMatches[0].label).toBe('A vs B');
  });
  it('mapNewsDetail players flatMap name', () => {
    const r = mapNewsDetail({ id: 'n1', title: 'T', relatedPlayers: [{ player: { id: 'p1', firstName: 'Edin', lastName: 'D' } }, { playerId: 'p2', player: { name: 'Anon' } }, { player: {} }] } as any);
    expect(r.relatedPlayers[0].name).toBe('Edin D'); expect(r.relatedPlayers[1].id).toBe('p2');
  });
  it('fetchNewsDetail poziva api', async () => {
    get.mockResolvedValue({ data: { id: 'n1', title: 'T', category: { id: 'c1' } } } as never);
    const r = await fetchNewsDetail('slug-a');
    expect(get).toHaveBeenCalledWith('/news/slug/slug-a'); expect(r.id).toBe('n1');
  });
  it('mapParticipations filter i map', () => {
    const r = mapParticipations([{ seasonId: 's1', seasonName: 'A', yearStart: 2023, isLeague: true, competitionId: 'c1' }, { seasonId: '' }] as any);
    expect(r.length).toBe(1); expect(r[0].seasonId).toBe('s1'); expect(r[0].isLeague).toBe(true);
  });
  it('mapTeamSeasonStats standing/totals/players', () => {
    const r = mapTeamSeasonStats({ season: { name: '2023' }, standing: { points: 10, played: 5, clubId: 'c1', form: 'WW' }, totals: { goals: 7, appearances: 3 }, players: [{ id: 'p1', firstName: 'A', stats: { goals: 2 } }, { firstName: 'B' }] } as any);
    expect(r.seasonName).toBe('2023'); expect(r.standing?.points).toBe(10); expect(r.totals?.goals).toBe(7); expect(r.players.length).toBe(1);
  });
  it('mapTeamSeasonStats bez standing/totals', () => {
    const r = mapTeamSeasonStats({ players: [] } as any);
    expect(r.standing).toBeUndefined(); expect(r.totals).toBeUndefined();
  });
  it('loadClubParticipations koristi activeSeasonCompetitions', async () => {
    get.mockResolvedValue({ data: [{ seasonId: 's1', isActive: true, isLeague: true, competitionId: 'c1', seasonName: 'A' }, { seasonId: 's1', isActive: false, isLeague: false, competitionId: 'c2', seasonName: 'A' }] } as never);
    const r = await loadClubParticipations('club1');
    expect(get).toHaveBeenCalledWith('/clubs/club1/participations'); expect(r.length).toBe(1); expect(r[0].competitionId).toBe('c1');
    get.mockResolvedValue({ data: [{ seasonId: 's1', isActive: true, isLeague: false, competitionId: 'c2', seasonName: 'B' }, { seasonId: 's1', isActive: true, isLeague: true, competitionId: 'c1', seasonName: 'A' }] } as never);
    const r2 = await loadClubParticipations('club1');
    expect(r2[0].isLeague).toBe(true);
  });
  it('loadClubSeasonStats bez i sa seasonId', async () => {
    get.mockImplementation(async (u: string, o?: any) => {
      if (u.includes('/stats')) return { laying: 1, data: { season: { name: 'S' }, standing: { points: 1 } } } as never;
      return { data: null } as never;
    });
    let r = await loadClubSeasonStats('c1');
    expect(get).toHaveBeenCalledWith('/clubs/c1/stats', { params: undefined });
    get.mockClear(); get.mockResolvedValue({ data: { standing: { points: 5 } } } as never);
    r = await loadClubSeasonStats('c1', 'e1');
    expect(get).toHaveBeenCalledWith('/clubs/c1/stats', { params: { seasonId: 'e1' } });
  });
  it('loadClubCompetition filter matches i highlight', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') return { data: { id: 'own' } } as never;
      if (u === '/statistics/standings') return { data: [{ clubId: 'c1', clubName: 'A' }, { clubId: 'c2' }] } as never;
      if (u === '/matches') return { data: [{ id: 'm1', status: 'FINISHED', homeClub: { id: 'c1', name: 'A' }, awayClub: { id: 'c3', name: 'C' } }, { id: 'm2', status: 'FINISHED', homeClub: { id: 'x', name: 'X' }, awayClub: { id: 'y', name: 'Y' } }] } as never;
      return { data: [] } as never;
    });
    const r = await loadClubCompetition('c1', 'e1');
    expect(r.standings[0].isHighlight).toBe(true); expect(r.matches.length).toBe(1); expect(r.matches[0].id).toBe('m1');
  });
  it('loadClubCompetition ownId fallback', async () => {
    get.mockImplementation(async (u: string) => {
      if (u === '/clubs/own') throw new Error('fail');
      if (u === '/statistics/standings') return { data: [{ clubId: 'c1' }] } as never;
      if (u === '/matches') return { data: [] } as never;
      return { data: [] } as never;
    });
    const r = await loadClubCompetition('c1', 'e1');
    expect(r.standings[0].isOwn).toBe(false);
  });
});
