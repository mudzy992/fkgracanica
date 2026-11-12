import { buttonVariants } from "../../../components/ui/button-variants";
import { cn } from "../../../lib/utils";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
;
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
  const { t } = useTranslation();
  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={t('admin.matchFinished.title')}>
      <div className="space-y-3 text-sm">
        <p>
          <strong>{match.homeClub?.name}</strong> {match.homeScore}:{match.awayScore}{' '}
          <strong>{match.awayClub?.name}</strong>
        </p>
        <p className="text-text-muted">
          {match.venue ?? '—'} · {toLocalDatetime(match.scheduledAt).replace('T', ' ')}
        </p>
        <p className="text-text-muted">{t('admin.matchFinished.locked')}</p>
        {canLive && canEditReport(match) && (
          <Link to={`/admin/matches/${match.id}/report`} className={cn(buttonVariants({variant: "default", size: "sm"}))}>{t('admin.matchFinished.editReport')}</Link>
        )}
        <MatchHighlightsEditor matchId={match.id} />
      </div>
    </AdminFormSheet>
  );
}
