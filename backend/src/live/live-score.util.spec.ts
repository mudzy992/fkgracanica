import { applyScore, isScoringEvent } from './live-score.util';

describe('live-score.util', () => {
  it('detects scoring events', () => {
    expect(isScoringEvent('GOAL')).toBe(true);
    expect(isScoringEvent('YELLOW_CARD')).toBe(false);
  });

  it('increments home goal', () => {
    expect(applyScore(1, 0, 'GOAL', 'home')).toEqual({ homeScore: 2, awayScore: 0 });
  });

  it('handles own goal for home team', () => {
    expect(applyScore(1, 0, 'OWN_GOAL', 'home')).toEqual({ homeScore: 1, awayScore: 1 });
  });
});
