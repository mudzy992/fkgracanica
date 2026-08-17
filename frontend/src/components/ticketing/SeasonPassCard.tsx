import { usePublicSettings } from '../../hooks';
import { TicketDigitalPass } from './TicketDigitalPass';
import type { TicketPassPrintData } from '../../lib/ticket-pass-document';

interface PassRow {
  id: string;
  status: string;
  label: string;
  price: string;
  qrCode: string;
  season?: { name: string };
}

export function SeasonPassCard({ pass }: { pass: PassRow }) {
  const { data: settings } = usePublicSettings();
  const data: TicketPassPrintData = {
    clubName: settings?.['club.name'] ?? 'FK Gračanica',
    crestUrl: settings?.['club.crestUrl'],
    matchTitle: pass.label,
    matchDate: pass.season?.name ?? 'Sezona',
    category: pass.label,
    price: String(pass.price),
    status: pass.status,
    qrValue: pass.status === 'ACTIVE' ? pass.qrCode : undefined,
    ticketRef: pass.id.slice(-8).toUpperCase(),
    seasonName: pass.season?.name,
  };
  return <TicketDigitalPass data={data} cancelled={pass.status === 'CANCELLED'} />;
}
