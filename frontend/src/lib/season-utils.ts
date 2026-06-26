export interface SeasonOption {
  id: string;
  name: string;
  isActive?: boolean;
  yearStart?: number;
  yearEnd?: number;
  competitionId?: string;
}

export function pickDefaultSeasonId(seasons: SeasonOption[]): string | undefined {
  return seasons.find((s) => s.isActive)?.id ?? seasons[0]?.id;
}

export function seasonLabel(season: SeasonOption): string {
  const years =
    season.yearStart && season.yearEnd ? ` (${season.yearStart}/${season.yearEnd})` : '';
  return `${season.name}${years}`;
}
