import { Link } from 'react-router-dom';
import { ClubCrest } from '../../../components/public/clubs/ClubCrest';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { matchStatusLabel, matchStatusTone } from '../../../lib/match-status-label';
import type { Match } from '../../../types';
import { deskHref } from './commentator-desk';

export function CommentatorLiveHero({ match }: { match: Match }) {
  const live = match.status === 'LIVE';
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge
          variant={matchStatusTone(match.status)}
          className={live ? 'animate-pulse bg-danger text-white' : undefined}
        >
          {matchStatusLabel(match.status)}
        </Badge>
        <p className="text-[10px] uppercase tracking-widest text-slate-400">Uživo na desku</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-end">
          <ClubCrest club={match.homeClub} size="sm" className="bg-white/10" />
          <p className="max-w-full truncate text-sm font-semibold">{match.homeClub?.name ?? 'Domaćin'}</p>
        </div>
        <p className="shrink-0 font-display text-4xl font-bold tabular-nums">
          {match.homeScore}
          <span className="mx-1 text-white/40">:</span>
          {match.awayScore}
        </p>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-start">
          <ClubCrest club={match.awayClub} size="sm" className="bg-white/10" />
          <p className="max-w-full truncate text-sm font-semibold">{match.awayClub?.name ?? 'Gost'}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link to={deskHref(match)}>
          <Button size="sm">Otvori desk</Button>
        </Link>
        <Link to={`/live/${match.id}`} target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20">
            Javni live
          </Button>
        </Link>
      </div>
    </div>
  );
}
