import type { Player } from '../../types';
import type { ClubSeasonStats } from '../../types/club-hub';

export function formationLabel(formation?: { def: number; mid: number; fwd: number } | null) {
  if (!formation) return null;
  return `${formation.def}-${formation.mid}-${formation.fwd}`;
}

export function statsByPlayerId(stats?: ClubSeasonStats) {
  const map = new Map<string, NonNullable<ClubSeasonStats['players'][0]['stats']>>();
  for (const p of stats?.players ?? []) {
    if (p.stats) map.set(p.id, p.stats);
  }
  return map;
}

export function topScorers(stats?: ClubSeasonStats, limit = 3) {
  return [...(stats?.players ?? [])]
    .filter((p) => (p.stats?.goals ?? 0) > 0)
    .sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))
    .slice(0, limit);
}

export function squadCounts(slots: { isBench: boolean; player?: unknown | null }[]) {
  const starters = slots.filter((s) => !s.isBench && s.player).length;
  const bench = slots.filter((s) => s.isBench && s.player).length;
  return { starters, bench, total: starters + bench };
}

export function spotlightPlayers(stats: ClubSeasonStats | undefined | null, roster: Player[]) {
  return topScorers(stats ?? undefined, 3)
    .map((s) => roster.find((p) => p.id === s.id))
    .filter((p): p is Player => !!p);
}
