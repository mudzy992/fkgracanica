import type { Match } from '../../../types';

const LIVE: Match['status'][] = ['LIVE', 'HALFTIME'];
const UPCOMING_WINDOW_MS = 3 * 3600_000;

export type DeskGroupKey = 'live' | 'today' | 'upcoming' | 'reports';

export type DeskGroup = {
  key: DeskGroupKey;
  label: string;
  matches: Match[];
};

function uniqueById(matches: Match[]): Match[] {
  const seen = new Set<string>();
  return matches.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export function isLiveDesk(match: Pick<Match, 'status'>): boolean {
  return LIVE.includes(match.status);
}

export function needsReport(match: Pick<Match, 'status' | 'reportStatus'>): boolean {
  if (match.status !== 'FINISHED') return false;
  return (match.reportStatus ?? 'DRAFT') === 'DRAFT';
}

export function awaitingApproval(match: Pick<Match, 'status' | 'reportStatus'>): boolean {
  return match.status === 'FINISHED' && match.reportStatus === 'PENDING_APPROVAL';
}

export function isTodayScheduled(match: Pick<Match, 'status' | 'scheduledAt'>, now = Date.now()): boolean {
  if (match.status !== 'SCHEDULED') return false;
  const day = new Date(match.scheduledAt);
  const current = new Date(now);
  return (
    day.getFullYear() === current.getFullYear() &&
    day.getMonth() === current.getMonth() &&
    day.getDate() === current.getDate()
  );
}

export function deskHref(match: Pick<Match, 'id' | 'status'>): string {
  if (match.status === 'FINISHED') return `/admin/matches/${match.id}/report`;
  return `/admin/live/${match.id}`;
}

export function deskCtaLabel(match: Pick<Match, 'status'>): string {
  return match.status === 'FINISHED' ? 'Izvještaj' : 'Desk';
}

export function pickLive(matches: Match[]): Match[] {
  return matches.filter(isLiveDesk);
}

export function pickToday(matches: Match[], now = Date.now()): Match[] {
  return matches
    .filter((m) => isTodayScheduled(m, now))
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
}

export function pickUpcoming(matches: Match[], now = Date.now()): Match[] {
  return matches
    .filter(
      (m) =>
        m.status === 'SCHEDULED' &&
        !isTodayScheduled(m, now) &&
        new Date(m.scheduledAt).getTime() >= now - UPCOMING_WINDOW_MS,
    )
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
    .slice(0, 8);
}

export function pickNeedsReport(matches: Match[]): Match[] {
  return matches.filter(needsReport);
}

export function pickAwaitingApproval(matches: Match[]): Match[] {
  return matches.filter(awaitingApproval);
}

export function pickCommentatorDeskMatches(matches: Match[], now = Date.now()): Match[] {
  return uniqueById([
    ...pickLive(matches),
    ...pickToday(matches, now),
    ...pickUpcoming(matches, now),
    ...pickNeedsReport(matches),
    ...pickAwaitingApproval(matches),
  ]);
}

export function groupDeskMatches(matches: Match[], now = Date.now()): DeskGroup[] {
  const groups: DeskGroup[] = [
    { key: 'live', label: 'Uživo', matches: pickLive(matches) },
    { key: 'today', label: 'Danas', matches: pickToday(matches, now) },
    { key: 'upcoming', label: 'Predstojeće', matches: pickUpcoming(matches, now) },
    {
      key: 'reports',
      label: 'Izvještaji',
      matches: [...pickNeedsReport(matches), ...pickAwaitingApproval(matches)],
    },
  ];
  return groups.filter((group) => group.matches.length > 0);
}

export function primaryDeskMatch(matches: Match[], now = Date.now()): Match | undefined {
  return pickLive(matches)[0] ?? pickToday(matches, now)[0] ?? pickUpcoming(matches, now)[0];
}

export function deskCounts(matches: Match[], now = Date.now()) {
  return {
    live: pickLive(matches).length,
    today: pickToday(matches, now).length,
    drafts: pickNeedsReport(matches).length,
    pending: pickAwaitingApproval(matches).length,
  };
}

export function matchTitle(match: Match): string {
  return `${match.homeClub?.name ?? 'Domaćin'} ${match.homeScore}:${match.awayScore} ${match.awayClub?.name ?? 'Gost'}`;
}
