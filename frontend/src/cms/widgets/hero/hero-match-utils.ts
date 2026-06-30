import type { Match } from '../../../types';

export function pickNextAndLast(matches: Match[] | undefined) {
  const next = matches
    ?.filter((m) => m.status === 'SCHEDULED' && new Date(m.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  const last = matches
    ?.filter((m) => m.status === 'FINISHED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0];
  return { next, last };
}
