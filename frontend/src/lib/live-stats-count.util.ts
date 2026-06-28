import type { Match, MatchEvent } from '../types';

export type TeamSide = 'home' | 'away';

export function resolveEventSide(
  event: Pick<MatchEvent, 'teamSide' | 'playerId' | 'player'>,
  homeClubId: string,
  awayClubId: string,
): TeamSide | null {
  if (event.teamSide === 'home' || event.teamSide === 'away') return event.teamSide;
  const clubId = event.player?.clubId;
  if (clubId === homeClubId) return 'home';
  if (clubId === awayClubId) return 'away';
  return null;
}

export function countEventsBySide(
  events: MatchEvent[] | undefined,
  types: string[],
  match: Match,
): { home: number; away: number; total: number } {
  const list = (events ?? []).filter((e) => types.includes(e.type));
  let home = 0;
  let away = 0;
  for (const ev of list) {
    const side = resolveEventSide(ev, match.homeClubId, match.awayClubId);
    if (side === 'home') home++;
    else if (side === 'away') away++;
  }
  return { home, away, total: home + away };
}
