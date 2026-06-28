import { Link } from 'react-router-dom';
import { formatDateTime } from '../../../lib/utils';
import { ClubCrest } from '../clubs/ClubCrest';
import { PremiumCard } from '../shell/PremiumCard';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import type { Match } from '../../../types';

export function LeagueLiveMatches({ matches }: { matches: Match[] }) {
  const live = matches.filter((m) => m.status === 'LIVE' || m.status === 'HALFTIME');
  if (!live.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">Uživo</h2>
      {live.map((m) => (
        <PremiumCard key={m.id} className="p-4" hover={false}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ClubCrest club={m.homeClub} size="sm" />
              <span className="font-medium">{m.homeClub?.name}</span>
              <span className="text-lg font-bold tabular-nums">{m.homeScore}:{m.awayScore}</span>
              <span className="font-medium">{m.awayClub?.name}</span>
              <ClubCrest club={m.awayClub} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger">{m.status === 'HALFTIME' ? 'Pauza' : 'UŽIVO'}</Badge>
              <span className="text-xs text-text-muted">{formatDateTime(m.scheduledAt)}</span>
              <Link to={`/live/${m.id}`}>
                <Button size="sm">Prati uživo</Button>
              </Link>
            </div>
          </div>
        </PremiumCard>
      ))}
    </section>
  );
}
