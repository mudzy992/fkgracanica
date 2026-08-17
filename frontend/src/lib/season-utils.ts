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

export function seasonYearKey(s: Pick<SeasonOption, 'yearStart' | 'yearEnd' | 'name'>): string {
  if (s.yearStart && s.yearEnd) return `${s.yearStart}/${s.yearEnd}`;
  return s.name;
}

export function seasonsInYear(seasons: SeasonOption[], yearKey: string): SeasonOption[] {
  return seasons.filter((s) => seasonYearKey(s) === yearKey);
}

export function pickActiveLeagueYearKey(seasons: SeasonOption[]): string | undefined {
  const league = filterLeagueSeasons(seasons);
  const id = pickDefaultSeasonId(league.length ? league : seasons);
  const picked = seasons.find((s) => s.id === id);
  return picked ? seasonYearKey(picked) : undefined;
}

export function competitionSeasonLabel(s: SeasonOption): string {
  return s.competition?.name ?? s.name;
}

export function seasonLabel(season: SeasonOption): string {
  const years =
    season.yearStart && season.yearEnd ? ` (${season.yearStart}/${season.yearEnd})` : '';
  return `${season.name}${years}`;
}
