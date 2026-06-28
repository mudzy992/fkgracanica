import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../../lib/utils';
import { matchRoundLabel } from '../../../lib/round-utils';
import { ClubCrest } from '../clubs/ClubCrest';
import { PremiumCard } from '../shell/PremiumCard';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
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
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">Sljedeća utakmica</h2>
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
            <Link to={`/live/${next.id}`}>
              <Button size="sm">Pre-match / Live</Button>
            </Link>
            <Link to={`/utakmice/${next.id}`}>
              <Button size="sm" variant="outline">
                Detalji
              </Button>
            </Link>
          </div>
        </div>
      </PremiumCard>
    </section>
  );
}
