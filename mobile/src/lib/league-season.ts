import { asArray, asRecord, asString } from './content-helpers';

export type LeagueSeasonChip = { id: string; name: string; isActive: boolean };

export function mapCalendarSeasons(data: unknown): LeagueSeasonChip[] {
  return asArray(data)
    .map((entry) => {
      const s = asRecord(entry);
      return {
        id: asString(s.id),
        name: asString(s.name, 'Sezona'),
        isActive: Boolean(s.isActive),
      };
    })
    .filter((s) => s.id);
}

export type LeagueEditionChip = { id: string; name: string; isLeague: boolean };

export function mapCalendarEditions(calendar: unknown): LeagueEditionChip[] {
  return asArray(asRecord(calendar).competitions)
    .map((ed) => {
      const edition = asRecord(ed);
      const competition = asRecord(edition.competition);
      return {
        id: asString(edition.id),
        name: asString(competition.name, 'Takmičenje'),
        isLeague: Boolean(competition.isLeague),
      };
    })
    .filter((e) => e.id)
    .sort((a, b) => Number(b.isLeague) - Number(a.isLeague) || a.name.localeCompare(b.name));
}

export function pickDefaultEditionId(
  editions: { id: string; isLeague: boolean }[],
  selected?: string,
): string {
  if (selected && editions.some((e) => e.id === selected)) return selected;
  return editions.find((e) => e.isLeague)?.id ?? editions[0]?.id ?? '';
}

export function leagueEditionId(calendar: unknown): string {
  return pickDefaultEditionId(mapCalendarEditions(calendar));
}

export function pickDefaultLeagueSeasonId(
  seasons: { id: string; isActive: boolean }[],
  selected?: string,
): string {
  if (selected && seasons.some((s) => s.id === selected)) return selected;
  return seasons.find((s) => s.isActive)?.id ?? seasons[0]?.id ?? '';
}

/** @deprecated Use mapCalendarSeasons */
export const mapLeagueSeasons = mapCalendarSeasons;
