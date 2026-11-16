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
import { loadClubCompetition } from '../components/club/load-club-competition';
import { loadClubPublic } from '../components/club/load-club-public';

const get = vi.mocked(api.get);

describe('mob-batch24 — P-MOB24 club loaders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockReset();
    get.mockResolvedValue({ data: null } as never);
  });

  it('loadClubCompetition vraća standings i filtrirane mečeve', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'own1' } } as never;
      if (url === '/statistics/standings') return { data: [{ clubId: 'c1', clubName: 'FK G', points: 10 }, { clubId: 'c2', clubName: 'Drugi', points: 8 }] } as never;
      if (url === '/matches') return { data: [{ id: 'm1', homeClub: { id: 'c1', name: 'FK G' }, awayClub: { id: 'c2', name: 'Drugi' }, status: 'SCHEDULED', scheduledAt: '2024-01-01T00:00:00Z' }, { id: 'm2', homeClub: { id: 'x', name: 'X' }, awayClub: { id: 'y', name: 'Y' }, status: 'FINISHED', homeScore: 1, awayScore: 0, scheduledAt: '2024-01-02T00:00:00Z' }] } as never;
      return { data: null } as never;
    });
    const res = await loadClubCompetition('c1', 's1');
    expect(res.standings[0].id).toBe('c1');
    expect(res.standings[0].isOwn).toBe(false);
    expect(res.standings[0].isHighlight).toBe(true);
    expect(res.matches.length).toBe(1);
    expect(res.matches[0].id).toBe('m1');
  });

  it('loadClubCompetition ownId iz ownRes i catch', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') throw new Error('fail');
      if (url === '/statistics/standings') return { data: [{ clubId: 'c1', clubName: 'A', points: 3 }] } as never;
      if (url === '/matches') return { data: [] } as never;
      return { data: null } as never;
    });
    const res = await loadClubCompetition('c1', 's1');
    expect(res.standings[0].isOwn).toBe(false);
  });

  it('loadClubCompetition filtrira samo klub mečeve', async () => {
    get.mockImplementation(async (url: string) => {
      if (url === '/clubs/own') return { data: { id: 'own' } } as never;
      if (url === '/statistics/standings') return { data: [] } as never;
      if (url === '/matches') return { data: [{ id: 'm1', homeClub: { id: 'c1' }, awayClub: { id: 'c2' }, status: 'LIVE', homeScore: 0, awayScore: 0, minute: 10, scheduledAt: '2024-01-01T00:00:00Z' }, { id: 'm2', homeClub: { id: 'c3' }, awayClub: { id: 'c4' }, status: 'LIVE', homeScore: 1, awayScore: 1, minute: 20, scheduledAt: '2024-01-01T00:00:00Z' }] } as never;
      return { data: null } as never;
    });
    const res = await loadClubCompetition('c3', 's1');
    expect(res.matches.map((m) => m.id)).toEqual(['m2']);
  });

  it('loadClubPublic mapira osnovne podatke', async () => {
    get.mockImplementation(async (url: string) => {
      if (url.includes('/clubs/public/')) return { data: { club: { id: 'c1', name: 'FK Gračanica', isOwnClub: true, crestPath: '/crest.png', city: 'Gračanica' }, stadium: { name: 'Luke', city: 'Gračanica', capacity: '2000' }, squad: { formation: { def: 4, mid: 3, fwd: 3 }, slots: [] }, seasonStats: { season: { name: '2024/25' }, standing: { points: 10, played: 5 }, totals: { goals: 5 } }, participations: [] } } as never;
      return { data: null } as never;
    });
    const res = await loadClubPublic('fk-gracanica');
    expect(res.clubId).toBe('c1');
    expect(res.clubName).toBe('FK Gračanica');
    expect(res.isOwnClub).toBe(true);
    expect(res.crestPath).toBe('/crest.png');
    expect(res.formation).toBe('4-3-3');
    expect(res.seasonName).toBe('2024/25');
    expect(res.stadium?.name).toBe('Luke');
    expect(res.stadium?.capacity).toBe(2000);
  });

  it('loadClubPublic mapira pitchSlots i igrače', async () => {
    get.mockImplementation(async (url: string) => {
      if (url.includes('/clubs/public/')) return { data: { club: { id: 'c1', name: 'Klub' }, squad: { formation: {}, slots: [{ id: 's1', positionX: 10, positionY: 50, lineRole: 'DEF', isBench: false, player: { id: 'p1', firstName: 'A', lastName: 'B', number: 5, position: 'DEF' } }, { id: 's2', isBench: true, player: { id: 'p2', firstName: 'C', lastName: 'D' } }] }, seasonStats: {}, participations: [] } } as never;
      return { data: null } as never;
    });
    const res = await loadClubPublic('klub');
    expect(res.players.length).toBe(2);
    expect(res.pitchSlots.length).toBe(1);
    expect(res.pitchSlots[0].player?.id).toBe('p1');
    expect(res.pitchSlots[0].lineRole).toBe('DEF');
  });

  it('loadClubPublic fallback players kad nema slots', async () => {
    get.mockImplementation(async (url: string) => {
      if (url.includes('/clubs/public/')) return { data: { club: { id: 'c1', name: 'Klub' }, squad: { formation: {}, slots: [] }, seasonStats: {}, players: [{ id: 'p1', firstName: 'Ime', lastName: 'Prez' }], participations: [] } } as never;
      return { data: null } as never;
    });
    const res = await loadClubPublic('klub');
    expect(res.players.length).toBe(1);
    expect(res.players[0].id).toBe('p1');
  });

  it('loadClubPublic mapira standing i totals', async () => {
    get.mockImplementation(async (url: string) => {
      if (url.includes('/clubs/public/')) return { data: { club: { id: 'c1', name: 'Klub' }, squad: {}, seasonStats: { standing: { clubId: 'c1', points: 12, played: 6, won: 4, form: 'WWWD' }, totals: { goals: 10, appearances: 6 } }, participations: [] } } as never;
      return { data: null } as never;
    });
    const res = await loadClubPublic('k');
    expect(res.standing?.points).toBe(12);
    expect(res.standing?.form).toBe('WWWD');
    expect(res.totals?.goals).toBe(10);
  });

  it('loadClubPublic participations filter', async () => {
    get.mockImplementation(async (url: string) => {
      if (url.includes('/clubs/public/')) return { data: { club: { id: 'c1', name: 'Klub' }, squad: {}, seasonStats: {}, participations: [{ seasonId: 's1', seasonName: '2023/24', competitionName: 'Liga', yearStart: 2023, isActive: true, isLeague: true }, { seasonId: '', seasonName: 'bad' }] } } as never;
      return { data: null } as never;
    });
    const res = await loadClubPublic('k');
    expect(res.participations.length).toBe(1);
    expect(res.participations[0].label).toBe('Liga (2023/24)');
  });

  it('loadClubPublic spotlight top 3 strijelca', async () => {
    get.mockImplementation(async (url: string) => {
      if (url.includes('/clubs/public/')) return { data: { club: { id: 'c1', name: 'Klub' }, squad: { slots: [{ player: { id: 'p1', firstName: 'A', lastName: 'A' } }, { player: { id: 'p2', firstName: 'B', lastName: 'B' } }, { player: { id: 'p3', firstName: 'C', lastName: 'C' } }, { player: { id: 'p4', firstName: 'D', lastName: 'D' } }] }, seasonStats: { players: [{ id: 'p1', stats: { goals: 10 } }, { id: 'p2', stats: { goals: 5 } }, { id: 'p3', stats: { goals: 7 } }, { id: 'p4', stats: { goals: 0 } }] }, participations: [] } } as never;
      return { data: null } as never;
    });
    const res = await loadClubPublic('k');
    expect(res.spotlight.length).toBe(3);
    expect(res.spotlight[0].id).toBe('p1');
  });

  it('loadClubPublic isOwnClub i crestPath fallback', async () => {
    get.mockImplementation(async (url: string) => {
      if (url.includes('/clubs/public/')) return { data: { club: { id: 'c1', name: 'Klub', isOwnClub: false, logoPath: '/logo.png' }, squad: {}, seasonStats: {}, participations: [] } } as never;
      return { data: null } as never;
    });
    const res = await loadClubPublic('k');
    expect(res.isOwnClub).toBe(false);
    expect(res.crestPath).toBe('/logo.png');
  });

  it('loadClubPublic prazan slug', async () => {
    get.mockResolvedValue({ data: { club: {}, squad: {}, seasonStats: {}, participations: [] } } as never);
    const res = await loadClubPublic('');
    expect(res.clubName).toBe('Klub');
    expect(res.clubId).toBe('');
  });
});
