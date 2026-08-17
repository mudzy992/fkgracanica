import { asArray, asRecord, asString } from './content-helpers';

export type LeagueSeasonChip = { id: string; name: string; isActive: boolean };

export function mapLeagueSeasons(data: unknown): LeagueSeasonChip[] {
  return asArray(data)
    .filter((entry) => Boolean(asRecord(asRecord(entry).competition).isLeague))
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

export function pickDefaultLeagueSeasonId(
  seasons: { id: string; isActive: boolean }[],
  selected?: string,
): string {
  if (selected && seasons.some((s) => s.id === selected)) return selected;
  return seasons.find((s) => s.isActive)?.id ?? seasons[0]?.id ?? '';
}
