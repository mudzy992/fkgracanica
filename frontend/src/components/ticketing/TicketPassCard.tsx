import type { ReactNode } from 'react';
import { useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { usePublicSettings } from '../../hooks';
import { canShowTicketQr } from '../../lib/ticketing-status';
import type { TicketRow } from '../../types/ticketing';
import { TicketDigitalPass, toTicketPassData } from './TicketDigitalPass';
import { TicketPassDownloadActions } from './TicketPassDownloadActions';

interface Props {
  ticket: TicketRow;
  orderActions?: ReactNode;
}

export function TicketPassCard({ ticket, orderActions }: Props) {
  const { data: settings } = usePublicSettings();
  const { data: config } = useTicketingPublicConfig();
  const clubName = settings?.['club.name'] ?? 'FK Gračanica';
  const data = toTicketPassData(ticket, {
    clubName,
    crestUrl: settings?.['club.crestUrl'],
    backgroundUrl: config?.ticketCardBackground ?? undefined,
  });
  const isCancelled = ticket.status === 'CANCELLED' || ticket.status === 'REFUND_REQUESTED';
  const showDownload = canShowTicketQr(ticket.status);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-subtle)] bg-surface/20 p-4 lg:flex-row lg:items-start">
      <TicketDigitalPass data={data} cancelled={isCancelled} />
      <div className="flex min-w-[150px] flex-col gap-2 lg:pt-2">
        {showDownload && <TicketPassDownloadActions data={data} />}
        {orderActions}
        {ticket.status === 'RESERVED' && (
          <p className="text-xs text-text-muted">Rezervacija — platite na blagajni ili online.</p>
        )}
        {ticket.status === 'USED' && (
          <p className="text-xs text-text-muted">Ulaznica je već iskorištena.</p>
        )}
      </div>
    </div>
  );
}
