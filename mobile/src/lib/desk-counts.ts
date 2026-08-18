export function deskCounts(matches: { status: string; reportStatus?: string }[]) {
  return {
    live: matches.filter((m) => m.status === 'LIVE' || m.status === 'HALFTIME').length,
    scheduled: matches.filter((m) => m.status === 'SCHEDULED').length,
    reports: matches.filter((m) => m.status === 'FINISHED' && m.reportStatus === 'PENDING_APPROVAL').length,
  };
}

function isSameDay(iso?: string, now = new Date()): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function filterCommentatorDesk<T extends { status?: string; reportStatus?: string; scheduledAt?: string }>(
  matches: T[],
): T[] {
  return matches.filter((m) => {
    const live = m.status === 'LIVE' || m.status === 'HALFTIME';
    const today = m.status === 'SCHEDULED' && isSameDay(m.scheduledAt);
    const report = m.status === 'FINISHED' && m.reportStatus === 'PENDING_APPROVAL';
    return live || today || report;
  });
}
