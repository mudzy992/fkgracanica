export const matchEditionInclude = {
  edition: { include: { competition: true, season: true } },
} as const;

type EditionShape = {
  competition?: { name?: string } | null;
  season?: { name?: string } | null;
};

export function withSeasonAlias<T extends { seasonCompetitionId: string; edition?: unknown }>(
  match: T,
) {
  const edition = match.edition as EditionShape | undefined;
  return {
    ...match,
    seasonId: match.seasonCompetitionId,
    season: edition
      ? { name: edition.season?.name ?? '', competition: edition.competition }
      : undefined,
  };
}
