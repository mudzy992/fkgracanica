import { matchWithinRoundLimit, resolveRoundNumber } from './round.util';

describe('round.util', () => {
  it('resolves round number from relation or legacy field', () => {
    expect(resolveRoundNumber({ round: 3 })).toBe(3);
    expect(resolveRoundNumber({ roundRel: { number: 5 } })).toBe(5);
    expect(resolveRoundNumber({ round: 2, roundRel: { number: 5 } })).toBe(5);
  });

  it('filters matches up to round', () => {
    expect(matchWithinRoundLimit({ round: 4 }, 5)).toBe(true);
    expect(matchWithinRoundLimit({ round: 6 }, 5)).toBe(false);
    expect(matchWithinRoundLimit({ roundRel: { number: 3 } }, 5)).toBe(true);
  });
});
