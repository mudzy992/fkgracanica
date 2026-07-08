import type { Match } from '../types';
import { clubCrestPath } from './club-utils';
import { mediaUrl } from './media';
import { formatDateTime } from './utils';
import { truncateMeta } from './seo-meta';

export function matchShareTitle(match: Pick<Match, 'homeClub' | 'awayClub' | 'status' | 'homeScore' | 'awayScore'>, live = false) {
  const home = match.homeClub?.name ?? 'Domaći';
  const away = match.awayClub?.name ?? 'Gosti';
  const liveTag = live || match.status === 'LIVE' || match.status === 'HALFTIME' ? ' — LIVE' : '';
  const scored =
    match.status === 'FINISHED' || match.status === 'LIVE' || match.status === 'HALFTIME'
      ? ` ${match.homeScore}:${match.awayScore}`
      : '';
  return `${home} vs ${away}${scored}${liveTag}`;
}

export function matchShareDescription(match: Match, live = false) {
  const home = match.homeClub?.name ?? 'Domaći';
  const away = match.awayClub?.name ?? 'Gosti';
  const parts = [`${home} vs ${away}`, formatDateTime(match.scheduledAt)];
  if (match.venue) parts.push(match.venue);
  if (match.season?.competition?.name) parts.push(match.season.competition.name);
  if (live || match.status === 'LIVE' || match.status === 'HALFTIME') {
    parts.push(`Uživo ${match.homeScore}:${match.awayScore}`);
  } else if (match.status === 'FINISHED') {
    parts.push(`Konačan rezultat ${match.homeScore}:${match.awayScore}`);
  } else if (match.status === 'SCHEDULED') {
    parts.push('Utakmica uskoro');
  }
  return truncateMeta(parts.join(' · '));
}

export function matchShareImage(match: Pick<Match, 'homeClub' | 'awayClub'>, fallbackCrest?: string | null) {
  return (
    mediaUrl(clubCrestPath(match.homeClub), 'medium') ??
    mediaUrl(clubCrestPath(match.awayClub), 'medium') ??
    mediaUrl(fallbackCrest ?? undefined, 'medium')
  );
}
