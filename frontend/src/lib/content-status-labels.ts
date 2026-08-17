export const CONTENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nacrt',
  PENDING: 'Na pregledu',
  PUBLISHED: 'Objavljeno',
  ARCHIVED: 'Arhivirano',
};

export function contentStatusLabel(status: string): string {
  return CONTENT_STATUS_LABELS[status] ?? status;
}
