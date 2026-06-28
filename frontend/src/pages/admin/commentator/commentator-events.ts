import { matchEventLabel } from '../../../lib/match-event-labels';

export const QUICK_EVENTS = ['GOAL', 'YELLOW_CARD', 'RED_CARD', 'PENALTY_SCORED', 'PENALTY_MISSED'] as const;
export const MORE_EVENTS = ['CORNER', 'FOUL', 'SHOT', 'SHOT_ON_TARGET', 'FREE_KICK', 'OFFSIDE', 'INJURY', 'OWN_GOAL'] as const;

export type QuickEvent = (typeof QUICK_EVENTS)[number];
export type MoreEvent = (typeof MORE_EVENTS)[number];

export function eventLabel(type: string) {
  return matchEventLabel(type);
}
