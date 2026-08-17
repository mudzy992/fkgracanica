import { useEffect, useMemo, useState } from 'react';
import { useClubParticipations, useClubStats } from '../../hooks/use-club-hub';
import {
  calendarKey,
  participationsInCalendar,
  pickDefaultParticipation,
  uniqueCalendarSeasons,
} from '../../lib/club-participation.util';
import { PublicPill } from '../public/PublicPill';
import { Skeleton } from '../ui/skeleton';
import { TeamSeasonStats } from './TeamSeasonStats';

export function TeamSeasonStatsSection({ clubId }: { clubId: string }) {
  const { data: participations } = useClubParticipations(clubId);
  const items = useMemo(() => participations ?? [], [participations]);
  const years = useMemo(() => uniqueCalendarSeasons(items), [items]);
  const [yearKey, setYearKey] = useState<string>();
  const [seasonId, setSeasonId] = useState<string>();

  useEffect(() => {
    const def = pickDefaultParticipation(items);
    const nextYear = def ? calendarKey(def) : years[0]?.key;
    setYearKey((prev) => (prev && years.some((y) => y.key === prev) ? prev : nextYear));
  }, [items, years]);

  const inYear = useMemo(() => {
    const rows = yearKey ? participationsInCalendar(items, yearKey) : [];
    return rows.slice().sort((a, b) => {
      const league = Number(b.isLeague) - Number(a.isLeague);
      return league || a.competitionName.localeCompare(b.competitionName);
    });
  }, [items, yearKey]);

  useEffect(() => {
    const def = pickDefaultParticipation(inYear);
    setSeasonId((prev) =>
      prev && inYear.some((p) => p.seasonId === prev) ? prev : def?.seasonId,
    );
  }, [inYear]);

  const { data: stats, isLoading } = useClubStats(clubId, seasonId);

  if (isLoading && !stats) return <Skeleton className="h-48 rounded-2xl" />;

  return (
    <div className="space-y-5">
      {years.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {years.map((y) => (
            <PublicPill key={y.key} active={y.key === yearKey} onClick={() => setYearKey(y.key)}>
              {y.label}
            </PublicPill>
          ))}
        </div>
      )}
      {inYear.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {inYear.map((p) => (
            <PublicPill
              key={p.seasonId}
              active={p.seasonId === seasonId}
              onClick={() => setSeasonId(p.seasonId)}
            >
              {p.competitionName}
              {p.isLeague ? ' · liga' : ''}
            </PublicPill>
          ))}
        </div>
      )}
      <TeamSeasonStats stats={stats} />
    </div>
  );
}
