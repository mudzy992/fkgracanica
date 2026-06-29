import { formatDate } from '../../lib/utils';
import { membershipStatusLabel } from '../../lib/membership-status';
import type { MembershipRow } from '../../types/membership';
import { MembershipQrCode } from './MembershipQrCode';

interface Props {
  membership: MembershipRow;
}

export function MembershipCardPanel({ membership }: Props) {
  const card = membership.card;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-background p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Digitalna članska kartica</p>
        <p className="mt-2 font-display text-2xl font-bold text-text">{card?.cardNumber ?? '—'}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Status</dt>
            <dd className="font-medium">{membershipStatusLabel(membership.status)}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Važi do</dt>
            <dd className="font-medium">
              {membership.endDate ? formatDate(membership.endDate) : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {card?.qrCode && (
        <div className="flex flex-col items-center gap-3">
          <MembershipQrCode value={card.qrCode} />
          <p className="text-center text-sm text-text-muted">Pokažite ovaj kod na ulazu ili blagajni</p>
        </div>
      )}
    </div>
  );
}
