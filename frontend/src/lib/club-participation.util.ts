export type ClubParticipation = {
  seasonId: string;
  seasonName: string;
  yearStart: number;
  yearEnd: number;
  isActive: boolean;
  competitionId: string;
  competitionName: string;
  isLeague: boolean;
};

export function participationLabel(p: ClubParticipation): string {
  return `${p.competitionName} (${p.seasonName})`;
}

export function pickDefaultParticipation(
  items: ClubParticipation[],
): ClubParticipation | undefined {
  const activeLeague = items.filter((p) => p.isActive && p.isLeague);
  if (activeLeague.length) {
    return [...activeLeague].sort((a, b) => b.yearStart - a.yearStart)[0];
  }
  const active = items.filter((p) => p.isActive);
  const pool = active.length ? active : items;
  return [...pool].sort((a, b) => b.yearStart - a.yearStart)[0];
}

export function participationYearKey(p: ClubParticipation): string {
  return `${p.yearStart}/${p.yearEnd}`;
}

export function uniqueParticipationYears(items: ClubParticipation[]): string[] {
  const seen = new Map<string, number>();
  for (const p of items) {
    const key = participationYearKey(p);
    if (!seen.has(key)) seen.set(key, p.yearStart);
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key);
}

export function participationsInYear(
  items: ClubParticipation[],
  yearKey: string,
): ClubParticipation[] {
  return items.filter((p) => participationYearKey(p) === yearKey);
}
