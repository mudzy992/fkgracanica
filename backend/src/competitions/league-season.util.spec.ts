import { ensureSingleLeagueCompetition, pickDefaultSeason } from './league-season.util';

describe('league-season.util', () => {
  const seasons = [
    { id: 'cup', isActive: true, yearStart: 2027, isLeague: false },
    { id: 'old-league', isActive: true, yearStart: 2025, isLeague: true },
    { id: 'new-league', isActive: true, yearStart: 2026, isLeague: true },
    { id: 'archived', isActive: false, yearStart: 2024, isLeague: true },
  ];

  it('allows multiple active seasons and prefers latest active league', () => {
    const picked = pickDefaultSeason(seasons, { leagueOnly: true });
    expect(picked?.id).toBe('new-league');
  });

  it('falls back to latest league season when none are active', () => {
    const inactive = seasons.map((s) => ({ ...s, isActive: false }));
    expect(pickDefaultSeason(inactive, { leagueOnly: true })?.id).toBe('new-league');
  });

  it('without leagueOnly prefers latest active regardless of type', () => {
    expect(pickDefaultSeason(seasons)?.id).toBe('cup');
  });

  it('unsets isLeague on every other competition', async () => {
    const updateMany = jest.fn();
    await ensureSingleLeagueCompetition(
      { competition: { updateMany } } as never,
      'keep-id',
    );
    expect(updateMany).toHaveBeenCalledWith({
      where: { isLeague: true, NOT: { id: 'keep-id' } },
      data: { isLeague: false },
    });
  });
});
