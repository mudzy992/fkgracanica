import { asRecord, asString } from '../../lib/content-helpers';

export type TicketValidateCard = {
  kind: 'ticket' | 'pass';
  status: string;
  category: string;
  matchLabel: string;
};

function matchLabelFrom(raw: unknown): string {
  const match = asRecord(raw);
  const home = asString(asRecord(match.homeClub).name);
  const away = asString(asRecord(match.awayClub).name);
  return home && away ? `${home} vs ${away}` : '';
}

export function mapTicketValidate(raw: unknown): TicketValidateCard | null {
  const record = asRecord(raw);
  const kind = record.kind === 'pass' ? 'pass' : 'ticket';
  const status = asString(record.status);
  if (!status && !asString(record.id)) return null;
  return {
    kind,
    status,
    category: asString(record.category),
    matchLabel: matchLabelFrom(record.match),
  };
}
