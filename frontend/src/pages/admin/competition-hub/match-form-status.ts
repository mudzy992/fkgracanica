import type { MatchStatus } from '../../../types';

export const editableStatuses: MatchStatus[] = [
  'SCHEDULED',
  'POSTPONED',
  'CANCELLED',
  'FINISHED',
];

export const matchStatusLabels: Record<MatchStatus, string> = {
  SCHEDULED: 'Zakazana',
  LIVE: 'Uživo',
  HALFTIME: 'Poluvrijeme',
  FINISHED: 'Završena',
  POSTPONED: 'Odgođena',
  CANCELLED: 'Otkazana',
};

export function matchStatusOptions() {
  return editableStatuses.map((s) => ({ id: s, label: matchStatusLabels[s] }));
}

export function clampScore(value: string | number): number {
  return Math.max(0, Math.floor(Number(value)) || 0);
}

export function canSendManualStatus(status: MatchStatus, isLiveLocked: boolean) {
  return !isLiveLocked && editableStatuses.includes(status);
}
