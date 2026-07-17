import type { Match } from '../../types/api';

export function isMatchLive(match: Match): boolean {
  return match.status === 'LIVE' || match.status === 'HALFTIME';
}

export function pickFeaturedMatch(matches: Match[]): Match | null {
  const live = matches
    .filter(isMatchLive)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  if (live[0]) return live[0];
  const now = Date.now();
  const upcoming = matches
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return upcoming[0] ?? null;
}

export function pickLastResult(matches: Match[]): Match | null {
  return (
    matches
      .filter((m) => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0] ?? null
  );
}
