export type ClubParticipation = {
  seasonId: string;
  calendarSeasonId?: string;
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

export function calendarKey(p: ClubParticipation): string {
  return p.calendarSeasonId ?? `${p.yearStart}/${p.yearEnd}`;
}

export function uniqueCalendarSeasons(
  items: ClubParticipation[],
): { key: string; label: string; yearStart: number }[] {
  const seen = new Map<string, { key: string; label: string; yearStart: number }>();
  for (const p of items) {
    const key = calendarKey(p);
    if (!seen.has(key)) seen.set(key, { key, label: p.seasonName, yearStart: p.yearStart });
  }
  return [...seen.values()].sort((a, b) => b.yearStart - a.yearStart);
}

export function participationsInCalendar(
  items: ClubParticipation[],
  key: string,
): ClubParticipation[] {
  return items.filter((p) => calendarKey(p) === key);
}
