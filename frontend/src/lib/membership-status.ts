import type { MembershipStatus } from '../types/membership';

export function membershipUserName(user?: { firstName?: string | null; lastName?: string | null; email?: string }) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return name || user?.email || '—';
}

export function membershipStatusLabel(status: MembershipStatus): string {
  const labels: Record<MembershipStatus, string> = {
    PENDING: 'Na čekanju',
    ACTIVE: 'Aktivno',
    SUSPENDED: 'Suspendovano',
    EXPIRED: 'Isteklo',
    CANCELLED: 'Otkazano',
  };
  return labels[status] ?? status;
}

export function membershipStatusVariant(
  status: MembershipStatus,
): 'default' | 'success' | 'muted' | 'danger' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'PENDING') return 'default';
  if (status === 'SUSPENDED' || status === 'EXPIRED') return 'danger';
  return 'muted';
}
