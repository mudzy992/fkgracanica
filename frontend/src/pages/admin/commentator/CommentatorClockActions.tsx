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
import { useConfirm } from '../../../hooks/use-confirm';
import { getApiErrorMessage } from '../../../lib/api-error';
import type { Match } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';
import { buildClockActions, clockBreakHint, type ClockActionKey } from './clock-actions';

const BTN = 'h-8 px-2.5 text-xs';
const STYLES = {
  primary: BTN,
  outline: cn(BTN, 'border-white/25 bg-white/10 text-white hover:bg-white/20'),
  end: cn(BTN, 'bg-red-600 text-white hover:bg-red-500'),
};

export function CommentatorClockActions({ match }: { match: Match }) {
  const [error, setError] = useState('');
  const { confirm, dialog } = useConfirm();
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
  const handlers: Record<ClockActionKey, () => Promise<unknown>> = {
    start: () => start.mutateAsync(match.id),
    ht: () => halftime.mutateAsync(match.id),
    end: () => end.mutateAsync(match.id),
    resume2: () => resume.mutateAsync(match.id),
    ft: () => finishRegular.mutateAsync(match.id),
    et: () => startExtra.mutateAsync(match.id),
    eth: () => etHalftime.mutateAsync(match.id),
    et2: () => resumeExtra.mutateAsync(match.id),
    etend: () => finishExtra.mutateAsync(match.id),
    pen: () => startPenalties.mutateAsync(match.id),
    penend: () => endPenalties.mutateAsync(match.id),
  };
  const actions = buildClockActions(match);
  const hint = clockBreakHint(match);

  const run = async (key: ClockActionKey, needsConfirm: boolean, label: string) => {
    if (needsConfirm) {
      const ok = await confirm({
        title: `${label}?`,
        description: 'Rezultat i sat se zaključavaju. Izvještaj ide na odobrenje.',
        variant: 'danger',
        confirmLabel: label,
      });
      if (!ok) return;
    }
    try {
      setError('');
      await handlers[key]();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Akcija nije uspjela.'));
    }
  };

  if (!actions.length && !error) return dialog;

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      {dialog}
      <div className="flex flex-wrap items-center gap-1.5">
        {hint ? (
          <Badge variant="muted" className="mr-1 text-[10px]">
            {hint}
          </Badge>
        ) : null}
        {actions.map((action) => (
          <Button
            key={action.key}
            size="sm"
            variant={action.style === 'end' ? 'danger' : action.style === 'outline' ? 'outline' : 'default'}
            className={STYLES[action.style]}
            disabled={busy}
            onClick={() => void run(action.key, !!action.confirm, action.label)}
          >
            {action.label}
          </Button>
        ))}
      </div>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
