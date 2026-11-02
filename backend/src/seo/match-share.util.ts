import { truncateMeta } from './seo-url.util';

function formatDateTime(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

type ClubLike =
  | { name: string; crestPath?: string | null; logoPath?: string | null }
  | null
  | undefined;

function crestPath(club: ClubLike) {
  return club?.crestPath ?? club?.logoPath ?? null;
}

export function matchShareTitle(
  home: ClubLike,
  away: ClubLike,
  status: string,
  homeScore: number,
  awayScore: number,
  live = false,
) {
  const h = home?.name ?? 'Domaći';
  const a = away?.name ?? 'Gosti';
  const liveTag =
    live || status === 'LIVE' || status === 'HALFTIME' ? ' — LIVE' : '';
  const scored =
    status === 'FINISHED' || status === 'LIVE' || status === 'HALFTIME'
      ? ` ${homeScore}:${awayScore}`
      : '';
  return `${h} vs ${a}${scored}${liveTag}`;
}

export function matchShareDescription(input: {
  home: ClubLike;
  away: ClubLike;
  scheduledAt: Date;
  venue?: string | null;
  competition?: string | null;
  status: string;
  homeScore: number;
  awayScore: number;
  live?: boolean;
}) {
  const h = input.home?.name ?? 'Domaći';
  const a = input.away?.name ?? 'Gosti';
  const date = formatDateTime(input.scheduledAt);
  const parts = [`${h} vs ${a}`, date];
  if (input.venue) parts.push(input.venue);
  if (input.competition) parts.push(input.competition);
  if (input.live || input.status === 'LIVE' || input.status === 'HALFTIME') {
    parts.push(`Uživo ${input.homeScore}:${input.awayScore}`);
  } else if (input.status === 'FINISHED') {
    parts.push(`Konačan rezultat ${input.homeScore}:${input.awayScore}`);
  } else if (input.status === 'SCHEDULED') {
    parts.push('Utakmica uskoro');
  }
  return truncateMeta(parts.join(' · '));
}

export function matchShareImage(
  home: ClubLike,
  away: ClubLike,
  fallbackCrest?: string | null,
) {
  return crestPath(home) ?? crestPath(away) ?? fallbackCrest ?? null;
}
