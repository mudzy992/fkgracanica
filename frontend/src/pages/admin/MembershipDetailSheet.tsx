import { formatDate, formatDateTime } from '../../lib/utils';
import {
  membershipStatusLabel,
  membershipStatusVariant,
  membershipUserName,
} from '../../lib/membership-status';
import { useMembershipDetail } from '../../hooks/use-membership';
import { usePublicSettings } from '../../hooks';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Badge } from '../../components/ui/badge';
import { MembershipCardPanel } from '../../components/membership/MembershipCardPanel';
import type { MembershipRow } from '../../types/membership';

interface Props {
  membership: MembershipRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembershipDetailSheet({ membership, open, onOpenChange }: Props) {
  const { data: detail } = useMembershipDetail(membership?.id);
  const { data: settings } = usePublicSettings();
  const m = detail ?? membership;
  if (!m) return null;

  const withUser: MembershipRow = {
    ...m,
    user: m.user ?? membership?.user,
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title="Detalj članstva" size="lg">
      {m.card ? (
        <MembershipCardPanel membership={withUser} />
      ) : null}
      <dl className="mt-6 space-y-4 border-t border-[var(--border-subtle)] pt-4 text-sm">
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
        {m.createdAt && (
          <div>
            <dt className="text-text-muted">Kreirano</dt>
            <dd>{formatDateTime(m.createdAt)}</dd>
          </div>
        )}
        {settings?.['club.name'] && (
          <div>
            <dt className="text-text-muted">Klub</dt>
            <dd>{settings['club.name']}</dd>
          </div>
        )}
      </dl>
    </AdminFormSheet>
  );
}
