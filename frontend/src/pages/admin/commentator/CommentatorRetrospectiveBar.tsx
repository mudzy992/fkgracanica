import { useState } from 'react';
import { useSubmitMatchReport } from '../../../hooks/use-live-report';
import { canEditReport, reportStatusLabel } from '../../../lib/match-report';
import { getApiErrorMessage } from '../../../lib/api-error';
import type { Match } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Card } from "../../../components/ui/card";

interface Props {
  match: Match;
  minute: number;
  onMinuteChange: (m: number) => void;
}

export function CommentatorRetrospectiveBar({ match, minute, onMinuteChange }: Props) {
  const { t } = useTranslation();
  const submit = useSubmitMatchReport();
  const [error, setError] = useState('');
  const editable = canEditReport(match);

  const onSubmit = async () => {
    try {
      setError('');
      await submit.mutateAsync(match.id);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Slanje nije uspjelo.'));
    }
  };

  return (
    <Card className="rounded-xl border border-[var(--border-subtle)] bg-gradient-to-r from-slate-900 to-slate-800 p-3 text-white sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            {t('admin.retrospective.title')}
          </p>
          <p className="font-display text-2xl font-bold tabular-nums">
            {match.homeScore}:{match.awayScore}
          </p>
          <p className="text-xs text-slate-300">
            {match.homeClub?.name} vs {match.awayClub?.name}
          </p>
        </div>
        <Badge variant="muted">{reportStatusLabel(match.reportStatus)}</Badge>
      </div>
      {editable && (
        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-white/10 pt-3">
          <div>
            <label className="text-[10px] uppercase text-slate-400">
              {t('admin.retrospective.minute')}
            </label>
            <Input
              type="number"
              min={0}
              max={130}
              value={minute}
              onChange={(e) => onMinuteChange(Number(e.target.value))}
              className="mt-1 h-8 w-20 bg-white/10 text-white"
            />
          </div>
          {match.reportStatus !== 'PENDING_APPROVAL' && (
            <Button
              size="sm"
              className="h-8"
              onClick={() => void onSubmit()}
              disabled={submit.isPending}
            >
              Pošalji na odobrenje
            </Button>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </Card>
  );
}
