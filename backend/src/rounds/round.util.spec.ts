import { matchWithinRoundLimit, resolveRoundNumber } from './round.util';

describe('round.util', () => {
  it('resolves round number from the Round relation', () => {
    expect(resolveRoundNumber({ roundRel: { number: 5 } })).toBe(5);
    // BE-09d: legacy skalarni `round` je uklonjen — bez `roundRel` nema broja kola.
    expect(resolveRoundNumber({})).toBeNull();
    expect(resolveRoundNumber({ roundRel: null })).toBeNull();
  });

  it('filters matches up to round', () => {
    expect(matchWithinRoundLimit({}, 5)).toBe(false);
    expect(matchWithinRoundLimit({ roundRel: { number: 3 } }, 5)).toBe(true);
  });
});
