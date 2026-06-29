import { formatDate, formatDateTime } from '../../lib/utils';
import {
  membershipStatusLabel,
  membershipStatusVariant,
  membershipUserName,
} from '../../lib/membership-status';
import { useMembershipDetail } from '../../hooks/use-membership';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Badge } from '../../components/ui/badge';
import { MembershipQrCode } from '../../components/membership/MembershipQrCode';
import type { MembershipRow } from '../../types/membership';

interface Props {
  membership: MembershipRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembershipDetailSheet({ membership, open, onOpenChange }: Props) {
  const { data: detail } = useMembershipDetail(membership?.id);
  const m = detail ?? membership;
  if (!m) return null;

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title="Detalj članstva" size="lg">
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-text-muted">Član</dt>
          <dd className="font-medium">{membershipUserName(m.user)}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Email</dt>
          <dd>{m.user?.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Status</dt>
          <dd>
            <Badge variant={membershipStatusVariant(m.status)}>
              {membershipStatusLabel(m.status)}
            </Badge>
          </dd>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Početak</dt>
            <dd>{m.startDate ? formatDate(m.startDate) : '—'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Istek</dt>
            <dd>{m.endDate ? formatDate(m.endDate) : '—'}</dd>
          </div>
        </div>
        {m.card && (
          <>
            <div>
              <dt className="text-text-muted">Broj kartice</dt>
              <dd className="font-mono font-medium">{m.card.cardNumber}</dd>
            </div>
            <div className="flex flex-col items-center gap-2 pt-2">
              <MembershipQrCode value={m.card.qrCode} />
              <p className="text-xs text-text-muted">QR za validaciju na ulazu</p>
            </div>
          </>
        )}
        {m.createdAt && (
          <div>
            <dt className="text-text-muted">Kreirano</dt>
            <dd>{formatDateTime(m.createdAt)}</dd>
          </div>
        )}
      </dl>
    </AdminFormSheet>
  );
}
