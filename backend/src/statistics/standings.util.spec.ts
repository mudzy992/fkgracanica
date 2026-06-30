import { computeStandings } from './standings.util';

describe('standings.util', () => {
  it('computes points and form', () => {
    const rows = computeStandings([
      {
        id: 'm1',
        homeClubId: 'a',
        awayClubId: 'b',
        homeScore: 2,
        awayScore: 1,
        status: 'FINISHED',
        scheduledAt: '2026-01-10',
        homeClub: { name: 'A', slug: 'a' },
        awayClub: { name: 'B', slug: 'b' },
      },
    ]);
    expect(rows[0].clubName).toBe('A');
    expect(rows[0].points).toBe(3);
    expect(rows[0].form).toBe('W');
    expect(rows[0].formMatches).toHaveLength(1);
    expect(rows[0].formMatches[0].opponentName).toBe('B');
  });

  it('uses last 5 league matches chronologically', () => {
    const mk = (id: string, day: number, homeScore: number, awayScore: number) => ({
      id,
      homeClubId: 'a',
      awayClubId: 'b',
      homeScore,
      awayScore,
      status: 'FINISHED',
      scheduledAt: `2026-01-${String(day).padStart(2, '0')}`,
      homeClub: { name: 'A', slug: 'a' },
      awayClub: { name: 'B', slug: 'b' },
    });
    const rows = computeStandings([
      mk('m1', 1, 1, 0),
      mk('m2', 2, 1, 0),
      mk('m3', 3, 1, 0),
      mk('m4', 4, 1, 0),
      mk('m5', 5, 1, 0),
      mk('m6', 6, 0, 1),
    ]);
    const home = rows.find((r) => r.clubId === 'a')!;
    expect(home.form).toBe('WWWWL');
    expect(home.formMatches).toHaveLength(5);
    expect(home.formMatches[4].result).toBe('L');
  });

  it('includes participants with zero stats when no matches played', () => {
    const rows = computeStandings(
      [],
      [
        { id: 'a', name: 'Alpha', slug: 'alpha' },
        { id: 'b', name: 'Beta', slug: 'beta' },
      ],
    );
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.played === 0 && r.points === 0)).toBe(true);
    expect(rows[0].clubName).toBe('Alpha');
    expect(rows[1].clubName).toBe('Beta');
  });
});
