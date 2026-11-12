export const matchEditionInclude = {
  edition: { include: { competition: true, season: true } },
} as const;

export const matchDetailInclude = {
  events: {
    orderBy: { minute: 'asc' as const },
    include: { player: true, relatedPlayer: true },
  },
  lineup: { include: { player: true, club: true } },
  liveComments: { orderBy: { createdAt: 'asc' as const } },
  highlights: { orderBy: { sortOrder: 'asc' as const } },
};

type EditionShape = {
  competition?: { name?: string } | null;
  season?: { name?: string } | null;
};

/**
 * BE-09d / P-B09d-5: `round` je uklonjen iz baze (`Match.round`), ali ostaje u API-ju kao
 * **izvedeno** polje iz `roundRel.number` (deprecated) — objavljene mobilne verzije ga čitaju.
 */
export function withSeasonAlias<
  T extends {
    seasonCompetitionId: string;
    edition?: unknown;
    roundRel?: { number?: number | null } | null;
  },
>(match: T) {
  const edition = match.edition as EditionShape | undefined;
  return {
    ...match,
    round: match.roundRel?.number ?? null,
    seasonId: match.seasonCompetitionId,
    season: edition
      ? { name: edition.season?.name ?? '', competition: edition.competition }
      : undefined,
  };
}
