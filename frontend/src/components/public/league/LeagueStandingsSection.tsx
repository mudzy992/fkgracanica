import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { Skeleton } from '../../ui/skeleton';
import { LeagueStandingsMobile } from './LeagueStandingsMobile';
import { LeagueStandingsTable } from './LeagueStandingsTable';
import type { StandingRow } from '../../../types';

interface Props {
  title: string;
  rows: StandingRow[];
  loading: boolean;
  positionChanges?: Map<string, number>;
  highlightClubId?: string;
}

export function LeagueStandingsSection({
  title,
  rows,
  loading,
  positionChanges,
  highlightClubId,
}: Props) {
  return (
    <section>
      <NewsSectionTitle>{title}</NewsSectionTitle>
      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="border-gradient-club glass-premium overflow-hidden rounded-2xl">
          <LeagueStandingsMobile
            rows={rows}
            positionChanges={positionChanges}
            highlightClubId={highlightClubId}
          />
          <div className="hidden overflow-x-auto lg:block">
            <LeagueStandingsTable
              rows={rows}
              positionChanges={positionChanges}
              highlightClubId={highlightClubId}
            />
          </div>
          {rows.length === 0 && (
            <p className="p-6 text-center text-sm text-text-muted">Tabela još nije dostupna.</p>
          )}
        </div>
      )}
    </section>
  );
}
