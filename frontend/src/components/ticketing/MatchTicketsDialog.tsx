import { formatDateTime } from '../../lib/utils';
import { matchLabel } from '../../lib/ticketing-status';
import type { MatchTicketGroup } from '../../lib/group-tickets-by-match';
import { useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { Dialog, DialogBody, DialogHeader } from '../ui/dialog';
import { TicketPassCard } from './TicketPassCard';
import { TicketOrderActions } from './TicketOrderActions';

interface Props {
  group: MatchTicketGroup | null;
  open: boolean;
  onClose: () => void;
}

export function MatchTicketsDialog({ group, open, onClose }: Props) {
  const { data: config } = useTicketingPublicConfig();
  if (!group) return null;

  const orderActionsShown = new Set<string>();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()} className="max-w-2xl">
      <DialogHeader onClose={onClose}>
        <div>
          <p className="text-base font-semibold">{matchLabel(group.match)}</p>
          {group.match?.scheduledAt && (
            <p className="text-sm font-normal text-text-muted">
              {formatDateTime(group.match.scheduledAt)}
            </p>
          )}
        </div>
      </DialogHeader>
      <DialogBody className="space-y-4">
        <p className="text-sm text-text-muted">
          {group.items.length} ulaznic{group.items.length === 1 ? 'a' : 'e'} za ovu utakmicu
        </p>

        {group.items.map(({ ticket, order }) => {
          const showOrder = !orderActionsShown.has(order.id);
          if (showOrder) orderActionsShown.add(order.id);

          return (
            <TicketPassCard
              key={ticket.id}
              ticket={ticket}
              orderActions={showOrder ? <TicketOrderActions order={order} config={config} /> : undefined}
            />
          );
        })}
      </DialogBody>
    </Dialog>
  );
}
