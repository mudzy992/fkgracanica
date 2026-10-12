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

  it('ranks by goals scored when points and goal difference are equal', () => {
    const opp = { name: 'Opp', slug: 'opp' };
    const mk = (
      id: string,
      homeId: string,
      awayId: string,
      homeScore: number,
      awayScore: number,
      homeClub: { name: string; slug: string },
      awayClub: { name: string; slug: string },
    ) => ({
      id,
      homeClubId: homeId,
      awayClubId: awayId,
      homeScore,
      awayScore,
      status: 'FINISHED',
      scheduledAt: `2026-02-${String(parseInt(id.slice(1), 10) + 10).padStart(2, '0')}`,
      homeClub,
      awayClub,
    });
    const g = { name: 'Gračanica', slug: 'gracanica' };
    const d = { name: 'Dijamant', slug: 'dijamant' };
    const rows = computeStandings(
      [
        mk('g1', 'gracanica', 'opp', 4, 2, g, opp),
        mk('g2', 'gracanica', 'opp', 2, 1, g, opp),
        mk('g3', 'gracanica', 'opp', 2, 1, g, opp),
        mk('g4', 'opp', 'gracanica', 2, 1, opp, g),
        mk('g5', 'opp', 'gracanica', 1, 0, opp, g),
        mk('d1', 'dijamant', 'opp', 2, 0, d, opp),
        mk('d2', 'dijamant', 'opp', 2, 0, d, opp),
        mk('d3', 'dijamant', 'opp', 3, 1, d, opp),
        mk('d4', 'opp', 'dijamant', 2, 0, opp, d),
        mk('d5', 'opp', 'dijamant', 2, 0, opp, d),
      ],
      [
        { id: 'gracanica', name: g.name, slug: g.slug },
        { id: 'dijamant', name: d.name, slug: d.slug },
        { id: 'opp', name: opp.name, slug: opp.slug },
      ],
    );
    const tied = rows.filter((r) => r.points === 9 && r.goalDifference === 2);
    expect(tied.map((r) => r.clubName)).toEqual(['Gračanica', 'Dijamant']);
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
