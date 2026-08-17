export function deskCounts(matches: { status: string; reportStatus?: string }[]) {
  return {
    live: matches.filter((m) => m.status === 'LIVE' || m.status === 'HALFTIME').length,
    scheduled: matches.filter((m) => m.status === 'SCHEDULED').length,
    reports: matches.filter((m) => m.status === 'FINISHED' && m.reportStatus === 'PENDING_APPROVAL').length,
  };
}
