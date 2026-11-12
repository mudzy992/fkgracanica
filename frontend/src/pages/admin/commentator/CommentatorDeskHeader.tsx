import { buttonVariants } from "../../../components/ui/button-variants";
import { cn } from "../../../lib/utils";
import { Link } from 'react-router-dom';
import { ClubCrest } from '../../../components/public/clubs/ClubCrest';
import { Badge } from '../../../components/ui/badge';
;
import { useRealtimeConnected } from '../../../hooks/use-realtime-connected';
import { matchStatusLabel, matchStatusTone } from '../../../lib/match-status-label';
import type { Match } from '../../../types';

function matchMeta(match: Match): string {
  const round = match.roundRel?.name ?? null;
  return [match.season?.competition?.name, round, match.venue].filter(Boolean).join(' · ');
}

export function CommentatorDeskHeader({
  match,
  title,
  publicHref,
  publicLabel,
}: {
  match: Match;
  title: string;
  publicHref: string;
  publicLabel: string;
}) {
  const connected = useRealtimeConnected();
  const meta = matchMeta(match);
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          {meta ? <p className="mt-1 text-sm text-text-muted">{meta}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={connected ? 'success' : 'muted'} className="text-[10px]">
            {connected ? 'Socket online' : 'Socket offline'}
          </Badge>
          <Badge variant={matchStatusTone(match.status)} className="text-[10px]">
            {matchStatusLabel(match.status)}
          </Badge>
          <Link to={publicHref} target="_blank" rel="noreferrer" className={cn(buttonVariants({variant: "outline", size: "sm"}))}>{publicLabel}</Link>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-surface/50 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ClubCrest club={match.homeClub} size="sm" />
          <p className="truncate text-sm font-semibold">{match.homeClub?.name ?? 'Domaćin'}</p>
        </div>
        <p className="shrink-0 font-display text-2xl font-bold tabular-nums text-text">
          {match.homeScore}:{match.awayScore}
        </p>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <p className="truncate text-right text-sm font-semibold">
            {match.awayClub?.name ?? 'Gost'}
          </p>
          <ClubCrest club={match.awayClub} size="sm" />
        </div>
      </div>
    </div>
  );
}
