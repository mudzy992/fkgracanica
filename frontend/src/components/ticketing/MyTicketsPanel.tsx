import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyTicketOrders } from '../../hooks/use-ticketing';
import {
  filterTicketOrders,
  ticketOrderFilterLabels,
  type TicketOrderFilter,
} from '../../lib/ticketing-status';
import { TicketOrderCard } from './TicketOrderCard';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

const FILTERS: TicketOrderFilter[] = ['active', 'reserved', 'closed', 'all'];

interface Props {
  paymentSuccess?: boolean;
}

export function MyTicketsPanel({ paymentSuccess }: Props) {
  const { data: orders, isLoading } = useMyTicketOrders();
  const [filter, setFilter] = useState<TicketOrderFilter>('active');
  const filtered = filterTicketOrders(orders ?? [], filter);

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-4 border-t border-[var(--border-subtle)] pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-text">Moje ulaznice</h3>
          <p className="text-sm text-text-muted">Kupljene, rezervisane i otkazane narudžbe.</p>
        </div>
        <Link to="/ulaznice">
          <Button size="sm" variant="outline">
            Kupi ulaznice
          </Button>
        </Link>
      </div>

      {paymentSuccess && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Uplata je uspješna. Vaše ulaznice su aktivirane.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
          >
            {ticketOrderFilterLabels[f]}
          </Button>
        ))}
      </div>

      {filtered.length ? (
        <div className="space-y-6">
          {filtered.map((o) => (
            <TicketOrderCard key={o.id} order={o} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          Nema narudžbi u kategoriji „{ticketOrderFilterLabels[filter]}”.
        </p>
      )}
    </div>
  );
}
