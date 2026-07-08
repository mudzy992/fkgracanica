function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** DD.MM.YYYY. */
export function formatDateBs(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}.`;
}

/** DD.MM.YYYY. HH:mm */
export function formatDateTimeBs(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${formatDateBs(iso)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
