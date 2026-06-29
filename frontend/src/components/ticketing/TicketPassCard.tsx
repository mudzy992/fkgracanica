import { formatDateTime } from '../../lib/utils';
import {
  canShowTicketQr,
  matchLabel,
  ticketStatusLabel,
  ticketStatusVariant,
} from '../../lib/ticketing-status';
import type { TicketRow } from '../../types/ticketing';
import { MembershipQrCode } from '../membership/MembershipQrCode';
import { Badge } from '../ui/badge';

interface Props {
  ticket: TicketRow;
}

export function TicketPassCard({ ticket }: Props) {
  const showQr = canShowTicketQr(ticket.status);
  const isCancelled = ticket.status === 'CANCELLED' || ticket.status === 'REFUND_REQUESTED';

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-background shadow-sm ${
        isCancelled ? 'border-danger/30 opacity-75' : 'border-[var(--border-subtle)]'
      }`}
    >
      <div
        className={`border-b px-4 py-3 sm:px-5 ${
          isCancelled ? 'border-danger/20 bg-danger/5' : 'border-[var(--border-subtle)] bg-primary/10'
        }`}
      >
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
          <Badge variant={ticketStatusVariant(ticket.status)}>{ticketStatusLabel(ticket.status)}</Badge>
        </div>
        {showQr && (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-surface/60 py-4">
            <MembershipQrCode value={ticket.qrCode} size={160} />
            <p className="text-center text-xs text-text-muted">Pokažite QR kod na ulazu u stadion</p>
          </div>
        )}
        {ticket.status === 'RESERVED' && (
          <p className="text-xs text-text-muted">Rezervacija — platite na blagajni ili online iz narudžbe.</p>
        )}
        {ticket.status === 'USED' && (
          <p className="text-xs text-text-muted">Ulaznica je već iskorištena na utakmici.</p>
        )}
      </div>
    </div>
  );
}
