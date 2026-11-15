import { describe, expect, it, vi } from 'vitest';

(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;

vi.mock('react-native', () => ({
  Vibration: { vibrate: vi.fn() },
  Platform: { OS: 'ios' },
  Linking: { openURL: vi.fn(async () => {}) },
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

import { isMatchLive, pickFeaturedMatch, pickLastResult } from '../components/home/pick-home-matches';
import { pickHeroConfig } from '../components/home/pick-hero-config';
import { mapStandingsRows } from '../components/league/map-standings';
import { mapLeaders, mapRounds, roundsPlayed } from '../components/league/map-league-lists';
import { isSameLockedQr } from '../components/staff/admission-scan';
import { parseHeritageTab } from '../components/heritage/load-heritage';
import type { Match } from '../types/api';
import type { CmsPage } from '../types/api';

function match(over: Partial<Match> & { scheduledAt: string; status: string }): Match {
  return {
    id: '1',
    homeClubId: 'h',
    awayClubId: 'a',
    homeScore: 0,
    awayScore: 0,
    venue: null,
    ...over,
  } as Match;
}

describe('mob-batch12 — P-MOB12 pick/mappers + heritage tab', () => {
  it('isMatchLive prepoznaje LIVE/HALFTIME', () => {
    expect(isMatchLive(match({ scheduledAt: new Date().toISOString(), status: 'LIVE' }))).toBe(true);
    expect(isMatchLive(match({ scheduledAt: new Date().toISOString(), status: 'HALFTIME' }))).toBe(true);
    expect(isMatchLive(match({ scheduledAt: new Date().toISOString(), status: 'SCHEDULED' }))).toBe(false);
    expect(isMatchLive(match({ scheduledAt: new Date().toISOString(), status: 'FINISHED' }))).toBe(false);
  });

  it('pickFeaturedMatch bira live pa najbliži upcoming', () => {
    const now = Date.now();
    const live = match({ id: 'live', scheduledAt: new Date(now - 1000).toISOString(), status: 'LIVE' });
    const future1 = match({ id: 'f1', scheduledAt: new Date(now + 60_000).toISOString(), status: 'SCHEDULED' });
    const future2 = match({ id: 'f2', scheduledAt: new Date(now + 120_000).toISOString(), status: 'SCHEDULED' });
    expect(pickFeaturedMatch([future1, live, future2])?.id).toBe('live');
    expect(pickFeaturedMatch([future2, future1])?.id).toBe('f1');
    expect(pickFeaturedMatch([])).toBeNull();
  });

  it('pickLastResult bira zadnji FINISHED', () => {
    const a = match({ id: 'a', scheduledAt: '2024-01-01T00:00:00Z', status: 'FINISHED' });
    const b = match({ id: 'b', scheduledAt: '2024-02-01T00:00:00Z', status: 'FINISHED' });
    const c = match({ id: 'c', scheduledAt: '2024-03-01T00:00:00Z', status: 'SCHEDULED' });
    expect(pickLastResult([a, c, b])?.id).toBe('b');
    expect(pickLastResult([c])).toBeNull();
  });

  it('pickHeroConfig vraća null bez hero i mapira hero', () => {
    expect(pickHeroConfig(null)).toBeNull();
    const pageNoHero = { sections: [{ widgetType: 'text', enabled: true, config: {} }] } as unknown as CmsPage;
    expect(pickHeroConfig(pageNoHero)).toBeNull();
    const page: CmsPage = {
      id: 'p1',
      slug: 'home',
      title: 'Home',
      sections: [
        {
          id: 's1',
          widgetType: 'hero',
          sortOrder: 0,
          enabled: true,
          config: { title: 'Naslov', subtitle: 'Pod', foundedYear: '1923', backgroundImage: '/bg.jpg', extra: 'x' },
        },
      ],
    };
    const cfg = pickHeroConfig(page);
    expect(cfg).toEqual({ title: 'Naslov', subtitle: 'Pod', foundedYear: '1923', backgroundImage: '/bg.jpg' });
    const pageEmptyStrings: CmsPage = {
      id: 'p2',
      slug: 'x',
      title: 't',
      sections: [{ id: 's2', widgetType: 'hero', sortOrder: 0, enabled: true, config: { title: '   ', subtitle: '' } }],
    };
    expect(pickHeroConfig(pageEmptyStrings)).toEqual({ title: undefined, subtitle: undefined, foundedYear: undefined, backgroundImage: undefined });
  });

  it('mapStandingsRows mapira redove i isOwn/isHighlight', () => {
    const rows = [
      { clubId: 'c1', clubName: 'FK Gračanica', points: 10, crestPath: '/a.png', played: 5, goalDifference: 3, form: 'WWL' },
      { clubId: 'c2', clubName: 'Drugi', points: 8 },
    ];
    const res = mapStandingsRows(rows as never, { ownId: 'c1', highlightId: 'c2' });
    expect(res[0].id).toBe('c1');
    expect(res[0].isOwn).toBe(true);
    expect(res[0].isHighlight).toBe(false);
    expect(res[0].position).toBe(1);
    expect(res[1].isHighlight).toBe(true);
    expect(res[1].clubName).toBe('Drugi');
  });

  it('mapStandingsRows prazno i highlight fallback', () => {
    expect(mapStandingsRows([], { ownId: 'x' })).toEqual([]);
    const rows = [{ clubId: 'c1' }];
    const res = mapStandingsRows(rows as never, { ownId: 'c1' });
    expect(res[0].isOwn).toBe(true);
    expect(res[0].isHighlight).toBe(true);
    expect(res[0].clubName).toBe('Tim 1');
  });

  it('mapLeaders mapira i filtrira prvih 8', () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({
      playerId: `p${i}`,
      firstName: 'Ime',
      lastName: `Prezime${i}`,
      value: i,
    }));
    const res = mapLeaders(rows as never);
    expect(res.length).toBe(8);
    expect(res[0].name).toBe('Ime Prezime0');
    expect(res[0].playerId).toBe('p0');
    const withEmpty = [{ playerId: '', firstName: 'A', lastName: 'B', value: 5 }];
    expect(mapLeaders(withEmpty as never)).toEqual([]);
  });

  it('mapRounds mapira i sortira', () => {
    const rows = [
      { id: 'r2', number: 2, name: 'Kolo 2' },
      { id: 'r1', number: 1 },
      { id: '', number: 3, name: 'bad' },
      { id: 'r3', number: 0, name: 'zero' },
    ];
    const res = mapRounds(rows as never);
    expect(res.map((r) => r.number)).toEqual([1, 2]);
    expect(res[0].name).toBe('1');
    expect(res[1].name).toBe('Kolo 2');
  });

  it('roundsPlayed vraća max FINISHED round', () => {
    const matches = [
      { status: 'FINISHED', roundRel: { number: 2 } },
      { status: 'FINISHED', roundRel: { number: 5 } },
      { status: 'LIVE', roundRel: { number: 10 } },
      { status: 'FINISHED', roundRel: { number: 3 } },
    ];
    expect(roundsPlayed(matches as never)).toBe(5);
    expect(roundsPlayed([] as never)).toBe(0);
  });

  it('isSameLockedQr provjerava lock', () => {
    expect(isSameLockedQr(null, 'abc')).toBe(false);
    expect(isSameLockedQr('abc', 'abc')).toBe(true);
    expect(isSameLockedQr('abc', 'def')).toBe(false);
    expect(isSameLockedQr('', 'abc')).toBe(false);
  });

  it('parseHeritageTab vraća validan tab ili timeline', () => {
    expect(parseHeritageTab('sponsors')).toBe('sponsors');
    expect(parseHeritageTab('trophies')).toBe('trophies');
    expect(parseHeritageTab('timeline')).toBe('timeline');
    expect(parseHeritageTab('hall')).toBe('hall');
    expect(parseHeritageTab('museum')).toBe('museum');
    expect(parseHeritageTab('unknown')).toBe('timeline');
    expect(parseHeritageTab(undefined)).toBe('timeline');
    expect(parseHeritageTab('')).toBe('timeline');
  });
});
