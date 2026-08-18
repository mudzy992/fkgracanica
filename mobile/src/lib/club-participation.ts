export type ClubParticipation = {
  seasonId: string;
  calendarSeasonId?: string;
  seasonName: string;
  yearStart: number;
  isActive: boolean;
  competitionId: string;
  competitionName: string;
  isLeague: boolean;
};

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

export function activeSeasonCompetitions(items: ClubParticipation[]): ClubParticipation[] {
  const active = items.filter((p) => p.isActive);
  const pool = active.length ? active : items;
  return [...pool].sort((a, b) => {
    const league = Number(b.isLeague) - Number(a.isLeague);
    return league || a.competitionName.localeCompare(b.competitionName);
  });
}
