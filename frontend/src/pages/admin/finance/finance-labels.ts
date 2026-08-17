export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Plaćeno',
  PENDING_ONLINE: 'Čeka online uplatu',
  PENDING_BOX_OFFICE: 'Čeka blagajnu',
  REFUNDED: 'Povraćeno',
  CANCELLED: 'Otkazano',
  ACTIVE: 'Aktivno članstvo',
};

export const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Svi statusi' },
  { value: 'CONFIRMED', label: PAYMENT_STATUS_LABELS.CONFIRMED },
  { value: 'PENDING_ONLINE', label: PAYMENT_STATUS_LABELS.PENDING_ONLINE },
  { value: 'PENDING_BOX_OFFICE', label: PAYMENT_STATUS_LABELS.PENDING_BOX_OFFICE },
  { value: 'REFUNDED', label: PAYMENT_STATUS_LABELS.REFUNDED },
  { value: 'CANCELLED', label: PAYMENT_STATUS_LABELS.CANCELLED },
] as const;

export type FinanceProviderKey = 'stripe' | 'paypal' | 'monri' | 'box_office' | 'membership';

export const PROVIDER_META: Record<
  FinanceProviderKey,
  { label: string; className: string }
> = {
  stripe: { label: 'Stripe', className: 'bg-[#635bff] text-white' },
  paypal: { label: 'PayPal', className: 'bg-[#0070ba] text-white' },
  monri: { label: 'Monri', className: 'bg-[#1a1a2e] text-white' },
  box_office: { label: 'Blagajna', className: 'bg-emerald-700 text-white' },
  membership: { label: 'Članarina', className: 'bg-primary/15 text-primary' },
};

export function isFinanceProvider(key: string): key is FinanceProviderKey {
  return key in PROVIDER_META;
}

export function paymentStatusLabel(key: string) {
  return PAYMENT_STATUS_LABELS[key] ?? key;
}

export function paymentStatusVariant(key: string): 'success' | 'default' | 'warning' | 'danger' | 'muted' {
  if (key === 'CONFIRMED' || key === 'ACTIVE') return 'success';
  if (key === 'PENDING_ONLINE' || key === 'PENDING_BOX_OFFICE') return 'warning';
  if (key === 'CANCELLED') return 'danger';
  return 'muted';
}

/** Calendar day dd.mm.yyyy without TZ shift. */
export function formatDay(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}.${m[2]}.${m[1]}.`;
}

export function formatKm(n: number) {
  return `${n.toLocaleString('bs-BA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`;
}

export function localIsoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
