import { canShowTicketQr, matchLabel } from '../../lib/ticketing-status';
import {
  clubCrestPath,
  ticketCompetitionName,
  ticketRoundLabel,
  ticketSeasonName,
} from '../../lib/ticket-match-meta';
import { formatDateTime } from '../../lib/utils';
import type { TicketPassPrintData } from '../../lib/ticket-pass-document';
import type { TicketRow } from '../../types/ticketing';
import { SportEventTicket } from './SportEventTicket';

interface Props {
  data: TicketPassPrintData;
  cancelled?: boolean;
}

export function TicketDigitalPass({ data, cancelled }: Props) {
  return <SportEventTicket data={{ ...data, cancelled }} />;
}

export function toTicketPassData(
  ticket: TicketRow,
  opts: { clubName: string; crestUrl?: string; backgroundUrl?: string },
): TicketPassPrintData {
  const m = ticket.match;
  return {
    clubName: opts.clubName,
    crestUrl: opts.crestUrl,
    backgroundUrl: opts.backgroundUrl,
    matchTitle: matchLabel(m),
    matchDate: m?.scheduledAt ? formatDateTime(m.scheduledAt) : '—',
    homeClubName: m?.homeClub?.name,
    awayClubName: m?.awayClub?.name,
    homeCrestUrl: clubCrestPath(m?.homeClub),
    awayCrestUrl: clubCrestPath(m?.awayClub),
    competitionName: ticketCompetitionName(m),
    seasonName: ticketSeasonName(m),
    roundLabel: ticketRoundLabel(m),
    category: ticket.category,
    price: String(ticket.price),
    status: ticket.status,
    qrValue: canShowTicketQr(ticket.status) ? ticket.qrCode : undefined,
    ticketRef: ticket.id.slice(-8).toUpperCase(),
  };
}

export function sampleTicketPreviewData(
  clubName: string,
  crestUrl?: string,
  backgroundUrl?: string,
): TicketPassPrintData {
  return {
    clubName,
    crestUrl,
    backgroundUrl,
    matchTitle: 'FK Gračanica vs Posjetilac',
    matchDate: 'Subota, 15.03.2026. · 15:00',
    homeClubName: clubName,
    awayClubName: 'Posjetilac',
    homeCrestUrl: crestUrl,
    competitionName: 'Prva liga Federacije BiH',
    seasonName: '2025/2026',
    roundLabel: '12. kolo',
    category: 'Tribina',
    price: '5',
    status: 'PAID_AT_BOX_OFFICE',
    qrValue: 'preview-ticket-qr',
    ticketRef: 'DEMO0001',
  };
}
