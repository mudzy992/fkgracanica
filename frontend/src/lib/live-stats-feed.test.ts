import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Match, MatchEvent } from '../types';
import { countEventsBySide, resolveEventSide } from './live-stats-count.util';
import { buildLiveStatsFeed, pickRandomStatItem } from './live-stats-feed';

const match = { id: 'm', homeClubId: 'home', awayClubId: 'away', homeClub: { name: 'Domaći' }, awayClub: { name: 'Gosti' } } as Match;
const event = (id: string, type: string, props: Partial<MatchEvent> = {}): MatchEvent => ({ id, type, minute: 12, ...props });

afterEach(() => vi.restoreAllMocks());

describe('live statistics', () => {
  it('stranu bira eksplicitno, zatim prema klubu igrača, a nepoznato ignoriše', () => {
    const homePlayer = { clubId: 'home', firstName: 'Test', lastName: 'Igrač' } as MatchEvent['player'];
    expect(resolveEventSide(event('1', 'FOUL', { teamSide: 'away', player: homePlayer }), 'home', 'away')).toBe('away');
    expect(resolveEventSide(event('2', 'FOUL', { player: homePlayer }), 'home', 'away')).toBe('home');
    expect(resolveEventSide(event('3', 'FOUL'), 'home', 'away')).toBeNull();
    expect(countEventsBySide([
      event('1', 'FOUL', { teamSide: 'home' }), event('2', 'FOUL', { teamSide: 'away' }),
      event('3', 'FOUL'), event('4', 'CORNER', { teamSide: 'home' }),
    ], ['FOUL'], match)).toEqual({ home: 1, away: 1, total: 2 });
  });

  it('gradi spiskove golova i kartona te samo neprazna poređenja', () => {
    const player = { clubId: 'home', firstName: 'Test', lastName: 'Igrač' } as MatchEvent['player'];
    const items = buildLiveStatsFeed({ ...match, events: [
      event('1', 'GOAL', { player, minute: 7 }),
      event('2', 'OWN_GOAL', { teamSide: 'away', minute: 9 }),
      event('3', 'SECOND_YELLOW', { teamSide: 'away', minute: 40 }),
      event('4', 'SHOT_ON_TARGET', { teamSide: 'home' }),
      event('5', 'SHOT_ON_TARGET', { teamSide: 'home' }),
      event('6', 'CORNER', { teamSide: 'away' }),
      event('7', 'OFFSIDE'),
    ] });
    expect(items.map((i) => i.id)).toEqual(['goals', 'yellow', 'red', 'shots-on', 'corners']);
    expect(items[0]).toMatchObject({ kind: 'player-list', homeClub: 'Domaći', awayClub: 'Gosti',
      homePlayers: [{ name: 'Test Igrač', minute: 7, isOwnGoal: false }],
      awayPlayers: [{ name: 'Nepoznat', minute: 9, isOwnGoal: true }] });
    expect(items[3]).toMatchObject({ kind: 'comparison', home: 2, away: 0 });
    expect(items[4]).toMatchObject({ kind: 'comparison', home: 0, away: 1 });
    expect(buildLiveStatsFeed(match)).toEqual([]);
  });

  it('slučajni izbor izbjegava prethodnu stavku kada postoje alternative', () => {
    const items = buildLiveStatsFeed({ ...match, events: [
      event('1', 'GOAL', { teamSide: 'home' }), event('2', 'CORNER', { teamSide: 'away' }),
    ] });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickRandomStatItem([])).toBeNull();
    expect(pickRandomStatItem(items, 'goals')?.id).toBe('corners');
    expect(pickRandomStatItem([items[0]], 'goals')?.id).toBe('goals');
  });
});
