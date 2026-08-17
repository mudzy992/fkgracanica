export interface SeasonOption {
  id: string;
  name: string;
  isActive?: boolean;
  yearStart?: number;
  yearEnd?: number;
  competitionId?: string;
  competition?: { id?: string; name?: string; isLeague?: boolean };
}

export function filterLeagueSeasons(seasons: SeasonOption[]): SeasonOption[] {
  return seasons.filter((s) => s.competition?.isLeague);
}

export function pickDefaultSeasonId(seasons: SeasonOption[]): string | undefined {
  const active = seasons.filter((s) => s.isActive);
  const pool = active.length ? active : seasons;
  return pool[0]?.id;
}

export function seasonLabel(season: SeasonOption): string {
  const years =
    season.yearStart && season.yearEnd ? ` (${season.yearStart}/${season.yearEnd})` : '';
  return `${season.name}${years}`;
}
