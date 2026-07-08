import { useState } from 'react';
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
  const [ack, setAck] = useState(false);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(o: boolean) => {
        if (!o) setAck(false);
        onOpenChange(o);
      }}
      title="Obrisati kolo i sve povezano?"
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
          <p className="text-danger">Ova radnja se ne može poništiti.</p>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />
            <span>Razumijem da se podaci ne mogu vratiti</span>
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
