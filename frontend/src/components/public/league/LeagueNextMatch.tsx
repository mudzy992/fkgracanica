import { buttonVariants } from "../../ui/button-variants";
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn, formatDateTime } from '../../../lib/utils';
import { matchRoundLabel } from '../../../lib/round-utils';
import { ClubCrest } from '../clubs/ClubCrest';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { PremiumCard } from '../shell/PremiumCard';
import { Badge } from '../../ui/badge';
;
import type { Match } from '../../../types';

function pickNextScheduled(matches: Match[]) {
  const now = Date.now();
  return [...matches]
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
}

export function LeagueNextMatch({ matches }: { matches: Match[] }) {
  const next = useMemo(() => pickNextScheduled(matches), [matches]);
  if (!next) return null;

  return (
    <section>
      <NewsSectionTitle>Sljedeća utakmica</NewsSectionTitle>
      <PremiumCard
        className="border-l-4 border-primary bg-primary/5 p-4 sm:p-5"
        hover={false}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Zakazano</Badge>
              {matchRoundLabel(next) && (
                <span className="text-xs text-text-muted">{matchRoundLabel(next)}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ClubCrest club={next.homeClub} size="sm" />
              <span className="font-semibold">{next.homeClub?.name}</span>
              <span className="text-text-muted">vs</span>
              <span className="font-semibold">{next.awayClub?.name}</span>
              <ClubCrest club={next.awayClub} size="sm" />
            </div>
            <p className="text-sm text-text-muted">
              {formatDateTime(next.scheduledAt)}
              {next.venue ? ` · ${next.venue}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/live/${next.id}`} className={cn(buttonVariants({size: "sm"}))}>Pre-match / Live</Link>
            <Link to={`/utakmice/${next.id}`} className={cn(buttonVariants({variant: "outline", size: "sm"}))}>Detalji</Link>
          </div>
        </div>
      </PremiumCard>
    </section>
  );
}
