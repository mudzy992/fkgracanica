import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';
import type { RoundDeleteImpact } from '../../../hooks/use-rounds';

interface Props {
  open: boolean;
  roundLabel: string;
  impact: RoundDeleteImpact;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RoundCascadeDeleteDialog({
  open,
  roundLabel,
  impact,
  isPending,
  onOpenChange,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [ack, setAck] = useState(false);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(o: boolean) => {
        if (!o) setAck(false);
        onOpenChange(o);
      }}
      title={t('admin.roundCascade.title')}
      description={
        <div className="space-y-3 text-sm text-text-muted">
          <p>
            Kolo <strong className="text-foreground">{roundLabel}</strong> sadrži{' '}
            <strong className="text-foreground">{impact.matchCount}</strong> utakmica.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>{impact.approvedReportCount} odobrenih izvještaja</li>
            <li>{impact.eventCount} događaja</li>
            <li>{impact.lineupCount} postava</li>
            <li>{impact.commentCount} komentara</li>
            <li>{impact.ticketCount} ulaznica</li>
          </ul>
          <p className="text-danger">{t('admin.roundCascade.irreversible')}</p>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />
            <span>{t('admin.roundCascade.ack')}</span>
          </label>
        </div>
      }
      confirmLabel="Obriši sve"
      variant="danger"
      isPending={isPending}
      confirmDisabled={!ack}
      onConfirm={onConfirm}
    />
  );
}
