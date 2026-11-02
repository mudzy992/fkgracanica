import { resolveClubVenue } from './match-venue.util';

describe('match-venue.util', () => {
  it('prefers stadiumRel name over legacy stadium field', () => {
    expect(
      resolveClubVenue({
        stadium: 'Legacy',
        stadiumRel: { name: 'Stadion FK Gračanica' },
      }),
    ).toBe('Stadion FK Gračanica');
  });

  it('falls back to legacy stadium field', () => {
    expect(resolveClubVenue({ stadium: 'Legacy stadion' })).toBe(
      'Legacy stadion',
    );
  });
});
