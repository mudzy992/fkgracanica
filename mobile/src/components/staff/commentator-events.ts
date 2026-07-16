export const QUICK_EVENTS = [
  'GOAL',
  'YELLOW_CARD',
  'RED_CARD',
  'PENALTY_SCORED',
  'PENALTY_MISSED',
  'SUBSTITUTION',
] as const;

export const MORE_EVENTS = [
  'CORNER',
  'FOUL',
  'SHOT',
  'SHOT_ON_TARGET',
  'FREE_KICK',
  'OFFSIDE',
  'INJURY',
  'OWN_GOAL',
] as const;

export type LiveEventType = (typeof QUICK_EVENTS)[number] | (typeof MORE_EVENTS)[number];

export const EVENT_I18N: Record<LiveEventType, string> = {
  GOAL: 'eventGoal',
  YELLOW_CARD: 'eventYellow',
  RED_CARD: 'eventRed',
  PENALTY_SCORED: 'eventPenaltyScored',
  PENALTY_MISSED: 'eventPenaltyMissed',
  SUBSTITUTION: 'eventSub',
  CORNER: 'eventCorner',
  FOUL: 'eventFoul',
  SHOT: 'eventShot',
  SHOT_ON_TARGET: 'eventShotOnTarget',
  FREE_KICK: 'eventFreeKick',
  OFFSIDE: 'eventOffside',
  INJURY: 'eventInjury',
  OWN_GOAL: 'eventOwnGoal',
};
