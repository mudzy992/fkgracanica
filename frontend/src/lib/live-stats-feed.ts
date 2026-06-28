import { countEventsBySide, resolveEventSide, type TeamSide } from './live-stats-count.util';
import type { Match, MatchEvent } from '../types';

export interface LiveStatPlayerEntry {
  name: string;
  minute: number;
  isOwnGoal?: boolean;
}

export type LiveStatComparison = {
  kind: 'comparison';
  id: string;
  label: string;
  awayClub: string;
  homeClub: string;
  away: number;
  home: number;
};

export type LiveStatPlayerList = {
  kind: 'player-list';
  id: string;
  label: string;
  awayClub: string;
  homeClub: string;
  awayPlayers: LiveStatPlayerEntry[];
  homePlayers: LiveStatPlayerEntry[];
};

export type LiveStatItem = LiveStatComparison | LiveStatPlayerList;

const SCORING = ['GOAL', 'PENALTY_SCORED', 'OWN_GOAL'];

function clubName(match: Match, side: TeamSide) {
  return side === 'home' ? (match.homeClub?.name ?? 'Domaćin') : (match.awayClub?.name ?? 'Gost');
}

function playerFromEvent(ev: MatchEvent): LiveStatPlayerEntry {
  const name = ev.player ? `${ev.player.firstName} ${ev.player.lastName}` : 'Nepoznat';
  return { name, minute: ev.minute, isOwnGoal: ev.type === 'OWN_GOAL' };
}

function buildPlayerListItem(
  match: Match,
  id: string,
  label: string,
  types: string[],
): LiveStatPlayerList | null {
  const events = (match.events ?? []).filter((e) => types.includes(e.type));
  if (!events.length) return null;

  const awayPlayers: LiveStatPlayerEntry[] = [];
  const homePlayers: LiveStatPlayerEntry[] = [];

  for (const ev of events) {
    const side = resolveEventSide(ev, match.homeClubId, match.awayClubId);
    const entry = playerFromEvent(ev);
    if (side === 'away') awayPlayers.push(entry);
    else if (side === 'home') homePlayers.push(entry);
  }

  return {
    kind: 'player-list',
    id,
    label,
    awayClub: clubName(match, 'away'),
    homeClub: clubName(match, 'home'),
    awayPlayers,
    homePlayers,
  };
}

function comparison(
  id: string,
  label: string,
  match: Match,
  types: string[],
): LiveStatComparison | null {
  const counts = countEventsBySide(match.events, types, match);
  if (!counts.total) return null;
  return {
    kind: 'comparison',
    id,
    label,
    awayClub: clubName(match, 'away'),
    homeClub: clubName(match, 'home'),
    away: counts.away,
    home: counts.home,
  };
}

export function buildLiveStatsFeed(match: Match): LiveStatItem[] {
  const items: LiveStatItem[] = [];

  const goals = buildPlayerListItem(match, 'goals', 'Golovi', SCORING);
  if (goals) items.push(goals);

  const yellow = buildPlayerListItem(match, 'yellow', 'Žuti kartoni', ['YELLOW_CARD', 'SECOND_YELLOW']);
  if (yellow) items.push(yellow);

  const red = buildPlayerListItem(match, 'red', 'Crveni kartoni', ['RED_CARD', 'SECOND_YELLOW']);
  if (red) items.push(red);

  const comparisons: [string, string, string[]][] = [
    ['shots-on', 'Udarci u okvir gola', ['SHOT_ON_TARGET']],
    ['corners', 'Korneri', ['CORNER']],
    ['fouls', 'Prekršaji', ['FOUL']],
    ['offsides', 'Zaleđa', ['OFFSIDE']],
  ];

  for (const [id, label, types] of comparisons) {
    const item = comparison(id, label, match, types);
    if (item) items.push(item);
  }

  return items;
}

export function pickRandomStatItem(items: LiveStatItem[], excludeId?: string): LiveStatItem | null {
  if (!items.length) return null;
  const pool = excludeId ? items.filter((i) => i.id !== excludeId) : items;
  const list = pool.length ? pool : items;
  return list[Math.floor(Math.random() * list.length)] ?? null;
}
