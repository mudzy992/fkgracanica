export function roundDefaultName(number: number): string {
  return `${number}. kolo`;
}

export function resolveRoundNumber(match: {
  round?: number | null;
  roundRel?: { number: number } | null;
}): number | null {
  return match.roundRel?.number ?? match.round ?? null;
}

export function matchWithinRoundLimit(
  match: { round?: number | null; roundRel?: { number: number } | null },
  upToRound: number,
): boolean {
  const n = resolveRoundNumber(match);
  return n != null && n <= upToRound;
}
