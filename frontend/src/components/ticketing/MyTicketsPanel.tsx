import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyTicketOrders } from '../../hooks/use-ticketing';
import {
  filterTicketOrders,
  ticketOrderFilterLabels,
  type TicketOrderFilter,
} from '../../lib/ticketing-status';
import { groupTicketsByMatch, type MatchTicketGroup } from '../../lib/group-tickets-by-match';
import { MatchTicketsSummaryCard } from './MatchTicketsSummaryCard';
import { MatchTicketsDialog } from './MatchTicketsDialog';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

const FILTERS: TicketOrderFilter[] = ['active', 'reserved', 'closed', 'all'];

interface Props {
  paymentSuccess?: boolean;
}

export function MyTicketsPanel({ paymentSuccess }: Props) {
  const { data: orders, isLoading } = useMyTicketOrders();
  const [filter, setFilter] = useState<TicketOrderFilter>('active');
  const [selected, setSelected] = useState<MatchTicketGroup | null>(null);
  const filtered = filterTicketOrders(orders ?? [], filter);
  const groups = groupTicketsByMatch(filtered);

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-text">Moje ulaznice</h3>
            <p className="text-sm text-text-muted">Pregled po utakmicama — kliknite za detalje.</p>
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

        {groups.length ? (
          <div className="space-y-3">
            {groups.map((g) => (
              <MatchTicketsSummaryCard
                key={g.matchId}
                group={g}
                onClick={() => setSelected(g)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Nema ulaznica u kategoriji „{ticketOrderFilterLabels[filter]}”.
          </p>
        )}
      </div>

      <MatchTicketsDialog
        group={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
