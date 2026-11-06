import { describe, expect, it } from 'vitest';
import { formatEventPlayers } from './live-event-text';
import type { MatchEvent } from '../types';

const ev = (over: Record<string, unknown> = {}) => over as unknown as MatchEvent;
const player = (firstName: string, lastName: string) => ({ firstName, lastName });

describe('formatEventPlayers', () => {
  it('zamjena prikazuje oba igrača strelicom', () => {
    expect(formatEventPlayers(ev({
      type: 'SUBSTITUTION', player: player('Amar', 'Hodžić'), relatedPlayer: player('Emir', 'Karić'),
    }))).toBe('Amar Hodžić → Emir Karić');
  });

  it('autogol dobija oznaku, ostali događaji samo ime', () => {
    expect(formatEventPlayers(ev({ type: 'OWN_GOAL', player: player('Amar', 'Hodžić') })))
      .toBe('Amar Hodžić (Autogol)');
    expect(formatEventPlayers(ev({ type: 'GOAL', player: player('Amar', 'Hodžić') }))).toBe('Amar Hodžić');
  });

  it('bez igrača vraća prazan tekst', () => {
    expect(formatEventPlayers(ev({ type: 'GOAL' }))).toBe('');
    expect(formatEventPlayers(ev({ type: 'SUBSTITUTION', player: player('A', 'B') }))).toBe('A B');
  });
});
