const STATUS_KEYS: Record<string, MatchStatusI18nKey> = {
  LIVE: 'matchLive',
  HALFTIME: 'matchHalftime',
  FINISHED: 'matchFinished',
  SCHEDULED: 'matchScheduled',
  POSTPONED: 'matchPostponed',
  CANCELLED: 'matchCancelled',
};

export type MatchStatusI18nKey =
  | 'matchLive'
  | 'matchHalftime'
  | 'matchFinished'
  | 'matchScheduled'
  | 'matchPostponed'
  | 'matchCancelled';

export function matchStatusKey(status: string): MatchStatusI18nKey {
  return STATUS_KEYS[status] ?? 'matchScheduled';
}

export function matchMetaLine(
  match: {
    season?: { competition?: { name?: string } | null };
    roundRel?: { number: number; name?: string | null } | null;
  },
  roundLabel: (n: number) => string,
): string {
  const competition = match.season?.competition?.name;
  const round =
    match.roundRel?.number != null && match.roundRel.number > 0
      ? roundLabel(match.roundRel.number)
      : match.roundRel?.name ?? undefined;
  return [competition, round].filter(Boolean).join(' · ');
}
