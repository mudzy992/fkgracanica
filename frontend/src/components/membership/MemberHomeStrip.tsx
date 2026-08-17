import { Link } from 'react-router-dom';
import { useMyMembership } from '../../hooks/use-membership';
import { useNotifications } from '../../hooks/use-notifications';
import { useNextHomeMatch } from '../../hooks/use-ticketing';
import { membershipStatusLabel } from '../../lib/membership-status';
import { formatDateTime } from '../../lib/utils';
import { PremiumCard } from '../public/shell/PremiumCard';
import type { MembershipRow } from '../../types/membership';

function pickCurrent(items: MembershipRow[] | undefined) {
  if (!items?.length) return undefined;
  return items.find((m) => m.status === 'ACTIVE') ?? items.find((m) => m.status === 'PENDING') ?? items[0];
}

export function MemberHomeStrip() {
  const { data: memberships } = useMyMembership();
  const { data: next } = useNextHomeMatch();
  const { data: unread } = useNotifications({ unreadOnly: true });
  const current = pickCurrent(memberships);
  const unreadCount = unread?.meta.total ?? unread?.data.length ?? 0;
  const nextHref = next ? `/utakmice/${next.id}` : '/ulaznice';
  const nextLabel = next
    ? `${next.homeClub?.name ?? 'Domaćin'} – ${next.awayClub?.name ?? 'Gost'}`
    : 'Nema zakazane utakmice';

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <PremiumCard className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Članarina</p>
        <p className="mt-2 text-lg font-semibold">
          {current ? membershipStatusLabel(current.status) : 'Niste član'}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {current?.card ? `Kartica ${current.card.cardNumber}` : 'Digitalna kartica nakon aktivacije'}
        </p>
      </PremiumCard>
      <Link to={nextHref} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <PremiumCard className="h-full p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Sljedeća utakmica</p>
          <p className="mt-2 text-lg font-semibold">{nextLabel}</p>
          <p className="mt-1 text-xs text-text-muted">
            {next ? formatDateTime(next.scheduledAt) : 'Ulaznice kad bude raspored'}
          </p>
        </PremiumCard>
      </Link>
      <PremiumCard className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Obavijesti</p>
        <p className="mt-2 text-lg font-semibold tabular-nums">{unreadCount}</p>
        <p className="mt-1 text-xs text-text-muted">Nepročitane — zvono u headeru</p>
      </PremiumCard>
    </div>
  );
}
