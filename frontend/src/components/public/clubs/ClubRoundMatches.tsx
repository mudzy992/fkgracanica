import { useEffect, useMemo, useState } from 'react';
import { useMatches } from '../../../hooks';
import { useRounds } from '../../../hooks/use-rounds';
import { matchRoundNumber, roundLabel } from '../../../lib/round-utils';
import { PublicPill } from '../PublicPill';
import { ClubLastRoundMatchesTable } from './ClubLastRoundMatchesTable';

interface Props {
  clubId: string;
  seasonId?: string;
}

export function ClubRoundMatches({ clubId, seasonId }: Props) {
  const { data: rounds, isLoading: rl } = useRounds(seasonId);
  const { data: matches, isLoading: ml } = useMatches(seasonId);

  const sorted = useMemo(
    () => [...(rounds ?? [])].sort((a, b) => a.number - b.number),
    [rounds],
  );

  const defaultRound = useMemo(() => {
    const withPlay = sorted.filter((r) =>
      (matches ?? []).some((m) => {
        const n = m.roundId === r.id || matchRoundNumber(m) === r.number;
        return n && (m.status === 'FINISHED' || m.status === 'LIVE');
      }),
    );
    return (withPlay.at(-1) ?? sorted.at(-1))?.number ?? null;
  }, [sorted, matches]);

  const [roundNumber, setRoundNumber] = useState<number | null>(null);

  useEffect(() => {
    setRoundNumber(defaultRound);
  }, [seasonId, defaultRound]);

  const selected = sorted.find((r) => r.number === roundNumber) ?? null;
  const roundMatches = useMemo(() => {
    if (!selected || !matches?.length) return [];
    return matches.filter((m) => {
      if (m.roundId && selected.id) return m.roundId === selected.id;
      return matchRoundNumber(m) === selected.number;
    });
  }, [matches, selected]);

  return (
    <div className="space-y-3">
      {sorted.length > 1 && (
        <div className="-mx-1 flex flex-wrap items-center gap-2 overflow-x-auto px-1 pb-1">
          {sorted.map((r) => (
            <PublicPill
              key={r.id}
              active={roundNumber === r.number}
              onClick={() => setRoundNumber(r.number)}
            >
              {roundLabel(r)}
            </PublicPill>
          ))}
        </div>
      )}
      {selected && (
        <p className="text-center text-sm font-medium text-primary-light">{roundLabel(selected)}</p>
      )}
      <ClubLastRoundMatchesTable
        matches={roundMatches}
        highlightClubId={clubId}
        loading={rl || ml}
      />
    </div>
  );
}
