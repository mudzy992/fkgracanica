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

export function leagueEditionId(calendar: unknown): string {
  const comps = asArray(asRecord(calendar).competitions);
  const league = comps.find((e) => Boolean(asRecord(asRecord(e).competition).isLeague));
  const pick = league ?? comps[0];
  return asString(asRecord(pick).id);
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
