import { buttonVariants } from "../../../components/ui/button-variants";
import { Link } from 'react-router-dom';
import { ClubCrest } from '../../../components/public/clubs/ClubCrest';
import { Badge } from '../../../components/ui/badge';
;
import { Skeleton } from '../../../components/ui/skeleton';
import { reportStatusLabel } from '../../../lib/match-report';
import { matchStatusLabel, matchStatusTone } from '../../../lib/match-status-label';
import { cn, formatDateTime } from '../../../lib/utils';
import type { Match } from '../../../types';
import { deskCtaLabel, deskHref, groupDeskMatches, matchTitle } from './commentator-desk';

function DeskRow({ match }: { match: Match }) {
  const reportHint = match.status === 'FINISHED' ? reportStatusLabel(match.reportStatus) : null;
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <ClubCrest club={match.homeClub} size="xs" />
        <div className="min-w-0">
          <p className="truncate font-medium">{matchTitle(match)}</p>
          <p className="text-xs text-text-muted">
            {formatDateTime(match.scheduledAt)}
            {reportHint ? ` · ${reportHint}` : ''}
          </p>
        </div>
        <ClubCrest club={match.awayClub} size="xs" />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={matchStatusTone(match.status)} className="text-[10px]">
          {matchStatusLabel(match.status)}
        </Badge>
        <Link to={deskHref(match)} className={cn(buttonVariants({size: "sm"}))}>{deskCtaLabel(match)}</Link>
      </div>
    </li>
  );
}

export function CommentatorDeskList({
  matches,
  isLoading,
}: {
  matches: Match[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  const groups = groupDeskMatches(matches);
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--border-subtle)] px-4 py-6 text-sm text-text-muted">
        Nema utakmica za desk. Kad bude zakazana ili uživo, pojaviće se ovdje.
      </p>
    );
  }
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-3 text-sm font-semibold text-text-muted">{group.label}</h2>
          <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
            {group.matches.map((match) => (
              <DeskRow key={match.id} match={match} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
