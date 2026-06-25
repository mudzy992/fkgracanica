export const MATCH_EVENT_LABELS: Record<string, string> = {
  KICKOFF: 'Početak',
  HALFTIME: 'Poluvrijeme',
  SECOND_HALF: 'Drugo poluvrijeme',
  FULL_TIME: 'Kraj',
  EXTRA_TIME: 'Produžeci',
  GOAL: 'Gol',
  OWN_GOAL: 'Autogol',
  PENALTY_SCORED: 'Penal izveden',
  PENALTY_MISSED: 'Promašen penal',
  CORNER: 'Korner',
  OFFSIDE: 'Zaleđe',
  FREE_KICK: 'Slobodan udarac',
  FOUL: 'Prekršaj',
  YELLOW_CARD: 'Žuti karton',
  RED_CARD: 'Crveni karton',
  SECOND_YELLOW: 'Drugi žuti karton',
  SUBSTITUTION: 'Izmjena',
  INJURY: 'Povreda',
  VAR: 'VAR',
  SHOT: 'Udarac',
  SHOT_ON_TARGET: 'Udarac u okvir',
  SAVE: 'Odbrana',
  COMMENT: 'Komentar',
};

export function matchEventLabel(type: string): string {
  return MATCH_EVENT_LABELS[type] ?? type;
}
