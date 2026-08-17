import { groupCalendarSeasons } from './calendar-season.util';
import { ensureSingleLeagueCompetition, findDefaultLeagueEdition, pickDefaultSeason } from './league-season.util';

describe('groupCalendarSeasons', () => {
  it('merges rows with the same yearStart/yearEnd into one calendar season', () => {
    const groups = groupCalendarSeasons([
      { id: 'liga', yearStart: 2025, yearEnd: 2026, isActive: true },
      { id: 'kup', yearStart: 2025, yearEnd: 2026, isActive: false },
      { id: 'old', yearStart: 2024, yearEnd: 2025, isActive: false },
    ]);
    expect(groups).toHaveLength(2);
    const current = groups.find((g) => g.yearStart === 2025);
    expect(current?.isActive).toBe(true);
    expect(current?.sourceIds).toEqual(['liga', 'kup']);
    expect(current?.name).toBe('2025/2026');
  });
});

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

  it('picks league edition of the latest active calendar season', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 'ed-new', season: { isActive: true, yearStart: 2026 } },
      { id: 'ed-old', season: { isActive: true, yearStart: 2025 } },
    ]);
    const picked = await findDefaultLeagueEdition({
      seasonCompetition: { findMany },
    } as never);
    expect(findMany).toHaveBeenCalledWith({
      where: { competition: { isLeague: true } },
      include: { season: true, competition: true },
      orderBy: { season: { yearStart: 'desc' } },
    });
    expect(picked?.id).toBe('ed-new');
  });

  it('falls back to latest league edition when no calendar is active', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 'ed-new', season: { isActive: false, yearStart: 2026 } },
      { id: 'ed-old', season: { isActive: false, yearStart: 2025 } },
    ]);
    const picked = await findDefaultLeagueEdition({
      seasonCompetition: { findMany },
    } as never);
    expect(picked?.id).toBe('ed-new');
  });

  it('uses unique (seasonId, competitionId) as edition identity', () => {
    const rows = [
      { seasonId: 'cal-1', competitionId: 'liga' },
      { seasonId: 'cal-1', competitionId: 'kup' },
      { seasonId: 'cal-1', competitionId: 'liga' },
    ];
    const keys = rows.map((r) => `${r.seasonId}:${r.competitionId}`);
    expect(new Set(keys).size).toBe(2);
  });
});
