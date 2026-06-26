import { computeStandings } from './standings.util';

describe('standings.util', () => {
  it('computes points and form', () => {
    const rows = computeStandings([
      {
        homeClubId: 'a',
        awayClubId: 'b',
        homeScore: 2,
        awayScore: 1,
        status: 'FINISHED',
        homeClub: { name: 'A', slug: 'a' },
        awayClub: { name: 'B', slug: 'b' },
      },
    ]);
    expect(rows[0].clubName).toBe('A');
    expect(rows[0].points).toBe(3);
    expect(rows[0].form).toBe('W');
  });
});
