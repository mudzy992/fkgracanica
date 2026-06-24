const EVENT_KEYS: Record<string, string> = {
  GOAL: 'eventGoal',
  YELLOW_CARD: 'eventYellow',
  RED_CARD: 'eventRed',
  SUBSTITUTION: 'eventSub',
  KICKOFF: 'eventKickoff',
  HALFTIME: 'eventHalftime',
  FULL_TIME: 'eventFullTime',
};

export function matchEventLabelKey(type: string): string {
  return EVENT_KEYS[type] ?? 'eventOther';
}
