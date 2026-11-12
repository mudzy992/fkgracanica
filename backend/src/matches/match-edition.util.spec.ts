import { withSeasonAlias } from './match-edition.util';

describe('withSeasonAlias', () => {
  const base = { seasonCompetitionId: 'season-1', id: 'match-1' };

  it('izvodi deprecated `round` iz roundRel (BE-09d)', () => {
    const out = withSeasonAlias({ ...base, roundRel: { number: 7 } });
    expect(out.round).toBe(7);
  });

  it('vraća `round: null` kad utakmica nema kolo', () => {
    expect(withSeasonAlias({ ...base, roundRel: null }).round).toBeNull();
    expect(withSeasonAlias(base).round).toBeNull();
  });

  it('zadržava season alias', () => {
    const out = withSeasonAlias({
      ...base,
      edition: {
        season: { name: '2025/26' },
        competition: { name: 'Premijer liga' },
      },
    });
    expect(out.seasonId).toBe('season-1');
    expect(out.season).toEqual({
      name: '2025/26',
      competition: { name: 'Premijer liga' },
    });
  });
});
