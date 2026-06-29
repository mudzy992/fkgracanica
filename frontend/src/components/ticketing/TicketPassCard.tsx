import { formatDateTime } from '../../lib/utils';
import { canShowTicketQr, matchLabel } from '../../lib/ticketing-status';
import type { TicketRow } from '../../types/ticketing';
import { MembershipQrCode } from '../membership/MembershipQrCode';
import { Badge } from '../ui/badge';

interface Props {
  ticket: TicketRow;
}

export function TicketPassCard({ ticket }: Props) {
  const paid = canShowTicketQr(ticket.status);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-background shadow-sm">
      <div className="border-b border-[var(--border-subtle)] bg-primary/10 px-4 py-3 sm:px-5">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Ulaznica</p>
        <p className="mt-1 font-display text-lg font-bold text-text">{matchLabel(ticket.match)}</p>
        {ticket.match?.scheduledAt && (
          <p className="text-sm text-text-muted">{formatDateTime(ticket.match.scheduledAt)}</p>
        )}
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-text-muted">
            {ticket.category} · <strong className="text-text">{String(ticket.price)} KM</strong>
          </p>
          <Badge variant={paid ? 'success' : 'default'}>{paid ? 'Plaćeno' : 'Rezervisano'}</Badge>
        </div>
        {paid && (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-surface/60 py-4">
            <MembershipQrCode value={ticket.qrCode} size={160} />
            <p className="text-center text-xs text-text-muted">Pokažite QR kod na ulazu u stadion</p>
          </div>
        )}
      </div>
    </div>
  );
}
