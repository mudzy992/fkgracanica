import type { Match, MatchReportStatus } from '../types';

export function canEditReport(match: Pick<Match, 'status' | 'reportStatus'>) {
  if (match.status !== 'FINISHED') return false;
  const rs = match.reportStatus ?? 'DRAFT';
  return rs === 'DRAFT' || rs === 'PENDING_APPROVAL';
}

export function reportStatusLabel(status?: MatchReportStatus) {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'Čeka odobrenje';
    case 'APPROVED':
      return 'Odobren';
    default:
      return 'Nacrt';
  }
}
