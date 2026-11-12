import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';
import { Switch } from '../../../components/ui/switch';
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
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-3">
            <span className="text-sm">{t('admin.roundCascade.ack')}</span>
            <Switch checked={ack} onCheckedChange={setAck} />
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
