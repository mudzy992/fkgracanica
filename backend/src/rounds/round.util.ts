export function roundDefaultName(number: number): string {
  return `${number}. kolo`;
}

export function resolveRoundNumber(match: {
  roundRel?: { number: number } | null;
}): number | null {
  return match.roundRel?.number ?? null;
}

export function matchWithinRoundLimit(
  match: { roundRel?: { number: number } | null },
  upToRound: number,
): boolean {
  const n = resolveRoundNumber(match);
  return n != null && n <= upToRound;
}
