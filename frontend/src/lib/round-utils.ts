export function roundLabel(round: { number: number; name?: string | null }): string {
  return round.name?.trim() || `${round.number}. kolo`;
}

export function matchRoundNumber(match: {
  roundRel?: { number: number; name?: string | null } | null;
}): number | null {
  return match.roundRel?.number ?? null;
}

export function matchRoundLabel(match: {
  roundRel?: { number: number; name?: string | null } | null;
}): string | null {
  return match.roundRel ? roundLabel(match.roundRel) : null;
}

export function groupMatchesByRound<
  T extends {
    roundRel?: { number: number; name?: string | null } | null;
    scheduledAt: string;
  },
>(matches: T[]): { key: number; label: string; matches: T[] }[] {
  const map = new Map<number, T[]>();
  for (const m of matches) {
    const n = matchRoundNumber(m);
    if (n == null) continue;
    const list = map.get(n) ?? [];
    list.push(m);
    map.set(n, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b - a)
    .map(([key, items]) => ({
      key,
      label: items[0]?.roundRel ? roundLabel(items[0].roundRel) : `${key}. kolo`,
      matches: items.sort(
        (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      ),
    }));
}
