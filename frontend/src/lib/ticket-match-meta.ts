import type { TicketMatch } from '../types/ticketing';

export function ticketRoundLabel(match?: TicketMatch): string | undefined {
  if (!match) return undefined;
  if (match.roundRel?.name?.trim()) return match.roundRel.name.trim();
  const n = match.roundRel?.number ?? match.round;
  if (n != null) return `${n}. kolo`;
  return undefined;
}

export function ticketCompetitionName(match?: TicketMatch): string | undefined {
  return match?.season?.competition?.name || match?.edition?.competition?.name || undefined;
}

export function ticketSeasonName(match?: TicketMatch): string | undefined {
  return match?.season?.name || match?.edition?.season?.name || undefined;
}

export function ticketMetaLine(match?: TicketMatch): string | undefined {
  const parts = [
    ticketCompetitionName(match),
    ticketSeasonName(match),
    ticketRoundLabel(match),
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
}

export function clubCrestPath(club?: { crestPath?: string | null } | null): string | undefined {
  return club?.crestPath || undefined;
}
