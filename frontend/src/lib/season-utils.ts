export interface SeasonEdition {
  id: string;
  competitionId: string;
  competition?: { id?: string; name?: string; isLeague?: boolean };
}

export interface CalendarSeason {
  id: string;
  name: string;
  isActive?: boolean;
  yearStart?: number;
  yearEnd?: number;
  competitions?: SeasonEdition[];
}

/** @deprecated Prefer CalendarSeason — kept for picker props. */
export type SeasonOption = CalendarSeason & {
  competitionId?: string;
  competition?: { id?: string; name?: string; isLeague?: boolean };
};

export function pickDefaultCalendarId(seasons: CalendarSeason[]): string | undefined {
  const active = seasons.filter((s) => s.isActive);
  const pool = (active.length ? active : seasons)
    .slice()
    .sort((a, b) => (b.yearStart ?? 0) - (a.yearStart ?? 0));
  return pool[0]?.id;
}

export function pickDefaultSeasonId(seasons: SeasonOption[]): string | undefined {
  return pickDefaultCalendarId(seasons);
}

export function leagueEdition(season?: CalendarSeason): SeasonEdition | undefined {
  const eds = season?.competitions ?? [];
  return eds.find((e) => e.competition?.isLeague) ?? eds[0];
}

export function sortedEditions(season?: CalendarSeason): SeasonEdition[] {
  return [...(season?.competitions ?? [])].sort((a, b) => {
    const league = Number(b.competition?.isLeague) - Number(a.competition?.isLeague);
    return league || (a.competition?.name ?? '').localeCompare(b.competition?.name ?? '');
  });
}

export function editionLabel(e: SeasonEdition): string {
  return e.competition?.name ?? 'Takmičenje';
}

export function seasonLabel(season: CalendarSeason): string {
  const years =
    season.yearStart && season.yearEnd ? ` (${season.yearStart}/${season.yearEnd})` : '';
  return `${season.name}${years}`;
}

export function findEdition(
  seasons: CalendarSeason[],
  editionId: string,
): { calendar: CalendarSeason; edition: SeasonEdition } | undefined {
  for (const calendar of seasons) {
    const edition = calendar.competitions?.find((e) => e.id === editionId);
    if (edition) return { calendar, edition };
  }
  return undefined;
}
