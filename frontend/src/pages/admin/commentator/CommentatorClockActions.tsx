import { useState } from 'react';
import {
  useEndAfterPenalties,
  useEndMatch,
  useExtraTimeHalftime,
  useFinishExtraTime,
  useFinishRegularTime,
  useHalftimeMatch,
  useResumeExtraSecond,
  useResumeMatch,
  useStartExtraTime,
  useStartMatch,
  useStartPenalties,
} from '../../../hooks/use-live-admin';
import { getApiErrorMessage } from '../../../lib/api-error';
import { canExtraHalftime, canHalftime, isTied } from '../../../lib/match-live-phase';
import type { Match } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export function CommentatorClockActions({ match }: { match: Match }) {
  const [error, setError] = useState('');
  const start = useStartMatch();
  const halftime = useHalftimeMatch();
  const resume = useResumeMatch();
  const end = useEndMatch();
  const finishRegular = useFinishRegularTime();
  const startExtra = useStartExtraTime();
  const etHalftime = useExtraTimeHalftime();
  const resumeExtra = useResumeExtraSecond();
  const finishExtra = useFinishExtraTime();
  const startPenalties = useStartPenalties();
  const endPenalties = useEndAfterPenalties();

  const busy =
    start.isPending ||
    halftime.isPending ||
    resume.isPending ||
    end.isPending ||
    finishRegular.isPending ||
    startExtra.isPending ||
    etHalftime.isPending ||
    resumeExtra.isPending ||
    finishExtra.isPending ||
    startPenalties.isPending ||
    endPenalties.isPending;

  const liveBreak = match.liveBreak ?? 'NONE';
  const period = match.matchPeriod;

  const run = async (fn: () => Promise<unknown>) => {
    try {
      setError('');
      await fn();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Akcija nije uspjela.'));
    }
  };

  const actions: { key: string; label: string; variant?: 'default' | 'outline' | 'ghost'; onClick: () => void }[] = [];

  if (match.status === 'SCHEDULED') {
    actions.push({ key: 'start', label: 'Započni', onClick: () => void run(() => start.mutateAsync(match.id)) });
  }
  if (canHalftime(match)) {
    actions.push({
      key: 'ht',
      label: 'Poluvrijeme',
      variant: 'outline',
      onClick: () => void run(() => halftime.mutateAsync(match.id)),
    });
    actions.push({
      key: 'end1',
      label: 'Završi',
      variant: 'ghost',
      onClick: () => void run(() => end.mutateAsync(match.id)),
    });
  }
  if (match.status === 'HALFTIME' && liveBreak === 'REGULAR_HT') {
    actions.push({
      key: 'resume2',
      label: '2. poluvrijeme',
      onClick: () => void run(() => resume.mutateAsync(match.id)),
    });
  }
  if (match.status === 'LIVE' && period === 'SECOND_HALF') {
    if (isTied(match)) {
      actions.push({
        key: 'ft',
        label: 'Kraj regularnog',
        variant: 'outline',
        onClick: () => void run(() => finishRegular.mutateAsync(match.id)),
      });
    } else {
      actions.push({
        key: 'end',
        label: 'Završi',
        variant: 'ghost',
        onClick: () => void run(() => end.mutateAsync(match.id)),
      });
    }
  }
  if (match.status === 'HALFTIME' && liveBreak === 'POST_REGULATION' && isTied(match)) {
    actions.push({
      key: 'et',
      label: 'Produžeci',
      onClick: () => void run(() => startExtra.mutateAsync(match.id)),
    });
  }
  if (match.status === 'LIVE' && period === 'EXTRA_FIRST' && canExtraHalftime(match)) {
    actions.push({
      key: 'eth',
      label: 'Pauza ET',
      variant: 'outline',
      onClick: () => void run(() => etHalftime.mutateAsync(match.id)),
    });
  }
  if (match.status === 'HALFTIME' && liveBreak === 'ET_HT') {
    actions.push({
      key: 'et2',
      label: '2. produžetak',
      onClick: () => void run(() => resumeExtra.mutateAsync(match.id)),
    });
  }
  if (match.status === 'LIVE' && period === 'EXTRA_SECOND') {
    if (isTied(match)) {
      actions.push({
        key: 'etend',
        label: 'Kraj produžetaka',
        variant: 'outline',
        onClick: () => void run(() => finishExtra.mutateAsync(match.id)),
      });
    } else {
      actions.push({
        key: 'end',
        label: 'Završi',
        variant: 'ghost',
        onClick: () => void run(() => end.mutateAsync(match.id)),
      });
    }
  }
  if (match.status === 'HALFTIME' && liveBreak === 'POST_EXTRA' && isTied(match)) {
    actions.push({
      key: 'pen',
      label: 'Penali',
      onClick: () => void run(() => startPenalties.mutateAsync(match.id)),
    });
  }
  if (match.status === 'LIVE' && period === 'PENALTIES') {
    actions.push({
      key: 'penend',
      label: 'Završi penale',
      variant: 'ghost',
      onClick: () => void run(() => endPenalties.mutateAsync(match.id)),
    });
  }

  if (!actions.length && !error) return null;

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {match.status === 'HALFTIME' && liveBreak !== 'NONE' && liveBreak !== 'REGULAR_HT' && (
          <Badge variant="muted" className="mr-1 text-[10px]">
            {liveBreak === 'POST_REGULATION' || liveBreak === 'POST_EXTRA' ? 'Neriješeno' : 'Pauza'}
          </Badge>
        )}
        {actions.map((a) => (
          <Button
            key={a.key}
            size="sm"
            variant={a.variant ?? 'default'}
            className="h-8 px-2.5 text-xs"
            disabled={busy}
            onClick={a.onClick}
          >
            {a.label}
          </Button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
