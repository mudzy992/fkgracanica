import { describe, expect, it, vi } from 'vitest';

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

import { mapNewsDetail } from '../components/news/load-news-detail';
import { mapLeagueMatches } from '../components/league/load-league-screen';
import { EVENT_I18N, MORE_EVENTS, QUICK_EVENTS } from '../components/staff/commentator-events';
import { ticketStatusKey } from '../components/ticket-status';

describe('mob-batch17 — P-MOB17 news/league/commentator', () => {
  it('mapNewsDetail prazan objekt vraća defaults', () => {
    const res = mapNewsDetail({} as never);
    expect(res.id).toBe('');
    expect(res.title).toBe('');
    expect(res.slug).toBe('');
    expect(res.content).toBe('');
    expect(res.excerpt).toBeNull();
    expect(res.photos).toEqual([]);
    expect(res.relatedMatches).toEqual([]);
    expect(res.relatedPlayers).toEqual([]);
    expect(res.category).toBeNull();
  });

  it('mapNewsDetail mapira gallery.photos i path fallback', () => {
    const raw = {
      id: 'n1',
      title: 'Naslov',
      slug: 'naslov',
      excerpt: 'Ex',
      content: '<p>Hi</p>',
      coverPath: '/cover.jpg',
      publishedAt: '2024-01-15T12:00:00Z',
      createdAt: '2024-01-14T00:00:00Z',
      category: { id: 'c1', name: 'Kategorija', slug: 'kat' },
      videoUrl: 'https://youtu.be/abc',
      gallery: {
        photos: [
          { id: 'ph1', path: 'originals/a.jpg' },
          { id: 'ph2', imagePath: 'originals/b.jpg' },
          { imagePath: 'originals/c.jpg' },
        ],
      },
    };
    const res = mapNewsDetail(raw as never);
    expect(res.id).toBe('n1');
    expect(res.coverPath).toBe('/cover.jpg');
    expect(res.videoUrl).toBe('https://youtu.be/abc');
    expect(res.category).toEqual({ id: 'c1', name: 'Kategorija', slug: 'kat' });
    expect(res.photos.length).toBe(3);
    expect(res.photos[0]).toEqual({ id: 'ph1', path: 'originals/a.jpg' });
    expect(res.photos[1].path).toBe('originals/b.jpg');
    expect(res.photos[2].id).toBe('2');
  });

  it('mapNewsDetail mapMatches label vs id fallback', () => {
    const raw = {
      relatedMatches: [
        { match: { id: 'm1', homeClub: { name: 'Dom' }, awayClub: { name: 'Gost' } } },
        { match: { id: 'm2', homeClub: { name: '' }, awayClub: { name: '' } } },
        { matchId: 'm3' },
        { match: {} },
      ],
    };
    const res = mapNewsDetail(raw as never);
    expect(res.relatedMatches.map((x) => x.id)).toEqual(['m1', 'm2', 'm3']);
    expect(res.relatedMatches[0].label).toBe('Dom vs Gost');
    expect(res.relatedMatches[1].label).toBe('m2');
    expect(res.relatedMatches[2].label).toBe('m3');
  });

  it('mapNewsDetail mapPlayers ime vs fallback', () => {
    const raw = {
      relatedPlayers: [
        { player: { id: 'p1', firstName: 'Edin', lastName: 'Džeko' } },
        { player: { id: 'p2', firstName: '', lastName: '' } },
        { player: { id: 'p3', name: 'Ime Prezime' } },
        { playerId: 'p4' },
        { player: {} },
      ],
    };
    const res = mapNewsDetail(raw as never);
    expect(res.relatedPlayers.map((x) => x.id)).toEqual(['p1', 'p2', 'p3', 'p4']);
    expect(res.relatedPlayers[0].name).toBe('Edin Džeko');
    expect(res.relatedPlayers[1].name).toBe('p2');
    expect(res.relatedPlayers[2].name).toBe('Ime Prezime');
  });

  it('mapLeagueMatches LIVE meta sa rezultatom i minutom', () => {
    const rows = [
      { id: 'm1', homeClub: { name: 'A', id: 'h1' }, awayClub: { name: 'B', id: 'a1' }, status: 'LIVE', homeScore: 1, awayScore: 2, minute: 33, scheduledAt: '2024-01-15T15:00:00Z' },
    ];
    const res = mapLeagueMatches(rows as never);
    expect(res[0].id).toBe('m1');
    expect(res[0].homeName).toBe('A');
    expect(res[0].awayName).toBe('B');
    expect(res[0].meta).toBe('1 : 2 · 33\'');
    expect(res[0].status).toBe('LIVE');
  });

  it('mapLeagueMatches HALFTIME meta live i fallback imena', () => {
    const rows = [{ status: 'HALFTIME', homeScore: 0, awayScore: 0, minute: 45 }];
    const res = mapLeagueMatches(rows as never);
    expect(res[0].homeName).toBe('Domaći');
    expect(res[0].awayName).toBe('Gosti');
    expect(res[0].meta).toBe('0 : 0 · 45\'');
    expect(res[0].id).toBe('0');
  });

  it('mapLeagueMatches FINISHED meta bez minute', () => {
    const rows = [{ id: 'm2', homeClub: { name: 'X' }, awayClub: { name: 'Y' }, status: 'FINISHED', homeScore: 3, awayScore: 1, minute: 90, scheduledAt: '2024-01-10T00:00:00Z' }];
    const res = mapLeagueMatches(rows as never);
    expect(res[0].meta).toBe('3 : 1');
  });

  it('mapLeagueMatches SCHEDULED meta vraća scheduledAt', () => {
    const rows = [{ id: 'm3', homeClub: { name: 'A' }, awayClub: { name: 'B' }, status: 'SCHEDULED', scheduledAt: '2024-02-01T18:00:00Z' }];
    const res = mapLeagueMatches(rows as never);
    expect(res[0].meta).toBe('2024-02-01T18:00:00Z');
    expect(mapLeagueMatches([] as never)).toEqual([]);
  });

  it('QUICK_EVENTS i MORE_EVENTS sadrže očekivane tipove', () => {
    expect(QUICK_EVENTS).toContain('GOAL');
    expect(QUICK_EVENTS).toContain('YELLOW_CARD');
    expect(QUICK_EVENTS.length).toBe(5);
    expect(MORE_EVENTS).toContain('CORNER');
    expect(MORE_EVENTS).toContain('OWN_GOAL');
    expect(MORE_EVENTS.length).toBe(8);
  });

  it('EVENT_I18N mapira sve tipove na event i18n ključeve', () => {
    expect(EVENT_I18N.GOAL).toBe('eventGoal');
    expect(EVENT_I18N.YELLOW_CARD).toBe('eventYellow');
    expect(EVENT_I18N.RED_CARD).toBe('eventRed');
    expect(EVENT_I18N.PENALTY_SCORED).toBe('eventPenaltyScored');
    expect(EVENT_I18N.SUBSTITUTION).toBe('eventSub');
    expect(EVENT_I18N.CORNER).toBe('eventCorner');
    expect(EVENT_I18N.OWN_GOAL).toBe('eventOwnGoal');
    expect(Object.keys(EVENT_I18N).length).toBe(QUICK_EVENTS.length + MORE_EVENTS.length + 1);
  });

  it('ticketStatusKey mapira poznate statuse i fallback', () => {
    expect(ticketStatusKey('RESERVED')).toBe('ticketStatusReserved');
    expect(ticketStatusKey('reserved')).toBe('ticketStatusReserved');
    expect(ticketStatusKey('PAID')).toBe('ticketStatusPaid');
    expect(ticketStatusKey('paid')).toBe('ticketStatusPaid');
    expect(ticketStatusKey('PAID_AT_BOX_OFFICE')).toBe('ticketStatusPaid');
    expect(ticketStatusKey('USED')).toBe('ticketStatusUsed');
    expect(ticketStatusKey('pending')).toBe('ticketStatusPending');
    expect(ticketStatusKey('PENDING')).toBe('ticketStatusPending');
    expect(ticketStatusKey('UNKNOWN')).toBe('status');
    expect(ticketStatusKey('')).toBe('status');
  });
});
