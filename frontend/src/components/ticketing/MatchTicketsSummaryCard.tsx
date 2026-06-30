import { ChevronRight, Ticket } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import { matchLabel } from '../../lib/ticketing-status';
import type { MatchTicketGroup } from '../../lib/group-tickets-by-match';
import { Badge } from '../ui/badge';

interface Props {
  group: MatchTicketGroup;
  onClick: () => void;
}

export function MatchTicketsSummaryCard({ group, onClick }: Props) {
  const paid = group.items.filter((i) => i.ticket.status === 'PAID_AT_BOX_OFFICE').length;
  const reserved = group.items.filter((i) => i.ticket.status === 'RESERVED').length;
  const closed = group.items.length - paid - reserved;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-surface/50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Ticket className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-text">{matchLabel(group.match)}</p>
        {group.match?.scheduledAt && (
          <p className="text-sm text-text-muted">{formatDateTime(group.match.scheduledAt)}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {paid > 0 && <Badge variant="success">{paid} plaćen{paid > 1 ? 'e' : 'a'}</Badge>}
          {reserved > 0 && <Badge variant="default">{reserved} rezervisan{reserved > 1 ? 'e' : 'a'}</Badge>}
          {closed > 0 && <Badge variant="muted">{closed} zatvoren{closed > 1 ? 'e' : 'a'}</Badge>}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-text-muted" />
    </button>
  );
}
