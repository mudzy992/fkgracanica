import type { MatchEvent } from '../types';

export function formatEventPlayers(ev: MatchEvent): string {
  if (ev.type === 'SUBSTITUTION' && ev.player && ev.relatedPlayer) {
    return `${ev.player.firstName} ${ev.player.lastName} → ${ev.relatedPlayer.firstName} ${ev.relatedPlayer.lastName}`;
  }
  if (ev.player) {
    const name = `${ev.player.firstName} ${ev.player.lastName}`;
    if (ev.type === 'OWN_GOAL') return `${name} (Autogol)`;
    return name;
  }
  return '';
}
