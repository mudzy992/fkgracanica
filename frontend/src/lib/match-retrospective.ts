import type { Match } from '../types';

export function isRetrospectiveMatch(
  match: Pick<Match, 'status' | 'clockStartedAt' | 'reportStatus'>,
): boolean {
  return (
    match.status === 'FINISHED' &&
    !match.clockStartedAt &&
    match.reportStatus !== 'APPROVED'
  );
}

export function isPastDatetime(value: string): boolean {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now() - 60_000;
}
