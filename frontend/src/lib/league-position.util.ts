import type { StandingRow } from '../types';

/** Pozitivno = tim se popeo na ljestvici (bolja pozicija). */
export function computePositionChanges(
  current: StandingRow[],
  previous: StandingRow[],
): Map<string, number> {
  const prevRank = new Map(previous.map((row, i) => [row.clubId, i + 1]));
  const changes = new Map<string, number>();
  current.forEach((row, i) => {
    const prev = prevRank.get(row.clubId);
    if (prev == null) return;
    changes.set(row.clubId, prev - (i + 1));
  });
  return changes;
}

export function maxFinishedRound(
  matches: { status: string; round?: number | null; roundRel?: { number: number } | null }[],
): number {
  let max = 0;
  for (const m of matches) {
    if (m.status !== 'FINISHED') continue;
    const n = m.roundRel?.number ?? m.round ?? 0;
    if (n > max) max = n;
  }
  return max;
}
