import { Link } from 'react-router-dom';
import { ClubCrest } from '../clubs/ClubCrest';
import { ClubLink } from '../clubs/ClubLink';
import { formatDateTime } from '../../../lib/utils';
import { groupMatchesByRound } from '../../../lib/round-utils';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { Club, Match } from '../../../types';

function MatchClubName({ club }: { club?: Club }) {
  if (!club) return <span>—</span>;
  if (club.slug) return <ClubLink slug={club.slug} name={club.name} className="text-base" />;
  return <span className="font-medium">{club.name}</span>;
}

function MatchCard({ match }: { match: Match }) {
  return (
    <Link to={`/utakmice/${match.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
              <MatchClubName club={match.homeClub} />
              <ClubCrest club={match.homeClub} size="sm" />
            </div>
            <p className="shrink-0 text-lg font-bold tabular-nums">
              {match.homeScore}:{match.awayScore}
            </p>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <ClubCrest club={match.awayClub} size="sm" />
              <MatchClubName club={match.awayClub} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{formatDateTime(match.scheduledAt)}</span>
            <Badge variant="muted">Kraj</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface Props {
  matches: Match[];
  loading: boolean;
}

export function LeagueResultsByRound({ matches, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200/80" />
        ))}
      </div>
    );
  }

  const finished = matches.filter((m) => m.status === 'FINISHED');
  const groups = groupMatchesByRound(finished);

  if (!groups.length) {
    return <p className="text-sm text-text-muted">Nema završenih utakmica.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.key} className="space-y-3">
          <h3 className="text-sm font-semibold text-text-muted">{group.label}</h3>
          {group.matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      ))}
    </div>
  );
}
