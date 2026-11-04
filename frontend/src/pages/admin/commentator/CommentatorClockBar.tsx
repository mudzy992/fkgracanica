import { useState } from 'react';
import { useSetStoppage } from '../../../hooks/use-live-admin';
import { useLiveClock } from '../../../hooks/use-live-clock';
import { formatLiveMinute } from '../../../lib/live-clock';
import { isPenaltiesPhase, stoppageHalfIndex } from '../../../lib/match-live-phase';
import type { Match } from '../../../types';
import { matchStatusLabel } from '../../../lib/match-status-label';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { CommentatorClockActions } from './CommentatorClockActions';
import { CommentatorStreamDialog } from './CommentatorStreamDialog';
import { useTranslation } from 'react-i18next';

export function CommentatorClockBar({ match }: { match: Match }) {
  const { t } = useTranslation();
  const clock = useLiveClock(match);
  const setStoppage = useSetStoppage();
  const [mins, setMins] = useState(3);
  const penalties = isPenaltiesPhase(match);
  const label = penalties ? 'PENALI' : formatLiveMinute(clock, match.minute);
  const half = stoppageHalfIndex(match.matchPeriod);

  const submitStoppage = () => {
    if (!half) return;
    void setStoppage.mutateAsync({ matchId: match.id, half, minutes: mins });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 p-3 text-white sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            {t('admin.commentatorClock.matchMinute')}
          </p>
          <p className="font-display text-3xl font-bold tabular-nums sm:text-4xl">{label}</p>
          {clock && <p className="mt-0.5 text-xs text-slate-300">{clock.periodLabel}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <CommentatorStreamDialog match={match} />
            <Badge variant={match.status === 'LIVE' ? 'danger' : 'muted'} className="text-[10px]">
              {matchStatusLabel(match.status)}
            </Badge>
          </div>
          <span className="text-xl font-bold tabular-nums sm:text-2xl">
            {match.homeScore}:{match.awayScore}
            {penalties && (
              <span className="ml-2 text-sm text-amber-300">
                ({match.penaltyHomeScore ?? 0}:{match.penaltyAwayScore ?? 0})
              </span>
            )}
          </span>
        </div>
      </div>

      <CommentatorClockActions match={match} />

      {clock?.needsStoppageInput && match.status === 'LIVE' && half && (
        <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-white/10 p-2.5">
          <p className="w-full text-xs text-amber-200">{t('admin.commentatorClock.stoppage')}</p>
          <Input
            type="number"
            min={1}
            max={15}
            value={mins}
            onChange={(e) => setMins(Number(e.target.value))}
            className="h-8 w-20 bg-white/10 text-sm text-white"
          />
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={submitStoppage}
            disabled={setStoppage.isPending}
          >
            +{mins} min
          </Button>
        </div>
      )}
    </div>
  );
}
