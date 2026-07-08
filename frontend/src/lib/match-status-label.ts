/** BS labeli za javni status utakmice */
const LABELS: Record<string, string> = {
  SCHEDULED: 'Zakazana',
  LIVE: 'Uživo',
  HALFTIME: 'Pauza',
  FINISHED: 'Završena',
  POSTPONED: 'Odgođena',
  CANCELLED: 'Otkazana',
};

export function matchStatusLabel(status: string): string {
  return LABELS[status] ?? status;
}

export function matchStatusTone(status: string): 'danger' | 'warning' | 'success' | 'muted' {
  if (status === 'LIVE') return 'danger';
  if (status === 'HALFTIME') return 'warning';
  if (status === 'FINISHED') return 'success';
  return 'muted';
}
