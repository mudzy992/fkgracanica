import { asRecord, asString } from '../../lib/content-helpers';

export type TicketValidateCard = {
  kind: 'ticket' | 'pass' | 'membership';
  status: string;
  category: string;
  matchLabel: string;
  name: string;
};

export type AdmissionOutcome = 'valid' | 'used' | 'invalid';

function matchLabelFrom(raw: unknown): string {
  const match = asRecord(raw);
  const home = asString(asRecord(match.homeClub).name);
  const away = asString(asRecord(match.awayClub).name);
  return home && away ? `${home} vs ${away}` : '';
}

export function mapTicketValidate(raw: unknown): TicketValidateCard | null {
  const record = asRecord(raw);
  const kind = record.kind === 'pass' ? 'pass' : record.kind === 'membership' ? 'membership' : 'ticket';
  const status = asString(record.status);
  if (!status && !asString(record.id)) return null;
  return {
    kind,
    status,
    category: asString(record.category),
    matchLabel: matchLabelFrom(record.match),
    name: asString(record.name),
  };
}

export function ticketOutcome(card: TicketValidateCard | null, error: string | null): AdmissionOutcome {
  if (error) {
    const msg = error.toLowerCase();
    if (msg.includes('iskorišten') || msg.includes('skeniran') || msg.includes('already')) return 'used';
    return 'invalid';
  }
  if (!card) return 'invalid';
  if (card.kind === 'membership') return card.status === 'ACTIVE' ? 'valid' : 'invalid';
  if (card.status === 'USED' || card.status === 'ADMITTED' || card.status === 'PAID_AT_BOX_OFFICE') return 'valid';
  return 'valid';
}
