import { Link } from 'react-router-dom';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { Button } from '../../../components/ui/button';
import { canEditReport } from '../../../lib/match-report';
import type { Match } from '../../../types';
import { toLocalDatetime } from './match-form-datetime';
import { MatchHighlightsEditor } from './MatchHighlightsEditor';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match;
  canLive: boolean;
}

export function MatchFinishedReadOnly({ open, onOpenChange, match, canLive }: Props) {
  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title="Utakmica (završena)">
      <div className="space-y-3 text-sm">
        <p>
          <strong>{match.homeClub?.name}</strong> {match.homeScore}:{match.awayScore}{' '}
          <strong>{match.awayClub?.name}</strong>
        </p>
        <p className="text-text-muted">
          {match.venue ?? '—'} · {toLocalDatetime(match.scheduledAt).replace('T', ' ')}
        </p>
        <p className="text-text-muted">Završena utakmica se ne može uređivati.</p>
        {canLive && canEditReport(match) && (
          <Link to={`/admin/matches/${match.id}/report`}>
            <Button type="button" variant="default" size="sm">Uredi izvještaj</Button>
          </Link>
        )}
        <MatchHighlightsEditor matchId={match.id} />
      </div>
    </AdminFormSheet>
  );
}
