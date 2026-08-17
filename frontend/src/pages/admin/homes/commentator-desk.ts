import type { Match } from '../../../types';

const LIVE: Match['status'][] = ['LIVE', 'HALFTIME'];

export function pickCommentatorDeskMatches(matches: Match[], now = Date.now()): Match[] {
  const live = matches.filter((m) => LIVE.includes(m.status));
  const upcoming = matches
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt).getTime() >= now - 3 * 3600_000)
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
    .slice(0, 8);
  const reports = matches.filter(
    (m) => m.status === 'FINISHED' && m.reportStatus === 'PENDING_APPROVAL',
  );
  const seen = new Set<string>();
  return [...live, ...upcoming, ...reports].filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export function matchTitle(match: Match): string {
  return `${match.homeClub?.name ?? 'Domaćin'} ${match.homeScore}:${match.awayScore} ${match.awayClub?.name ?? 'Gost'}`;
}
