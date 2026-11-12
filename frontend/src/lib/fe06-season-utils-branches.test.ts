import { describe, expect, it } from 'vitest';
import {
  leagueEdition,
  pickDefaultCalendarId,
  sortedEditions,
  type CalendarSeason,
} from './season-utils';

/**
 * Batch 34 — grane koje traže nepotpune podatke: sezona bez `yearStart`,
 * sezona bez `competitions` i izdanja bez naziva takmičenja.
 */
describe('pickDefaultCalendarId — nedostajuće godine', () => {
  it('sezona bez `yearStart` tretira se kao nula i ne ruši sortiranje', () => {
    const bezGodine: CalendarSeason = { id: 'bez', name: 'Bez godine' };
    const saGodinom: CalendarSeason = { id: 'sa', name: 'Sa godinom', yearStart: 2024 };
    expect(pickDefaultCalendarId([bezGodine, saGodinom])).toBe('sa');
    expect(pickDefaultCalendarId([saGodinom, bezGodine])).toBe('sa');
  });

  it('dvije sezone bez godine daju prvu iz niza', () => {
    expect(
      pickDefaultCalendarId([
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
      ]),
    ).toBe('a');
  });
});

describe('leagueEdition — bez takmičenja', () => {
  it('sezona bez `competitions` nema izdanje', () => {
    expect(leagueEdition({ id: 's', name: 'S' })).toBeUndefined();
  });

  it('prazna lista takmičenja nema izdanje', () => {
    expect(leagueEdition({ id: 's', name: 'S', competitions: [] })).toBeUndefined();
  });

  it('bez lige vraća prvo takmičenje', () => {
    const cup = { id: 'cup', competitionId: 'c', competition: { name: 'Kup', isLeague: false } };
    expect(leagueEdition({ id: 's', name: 'S', competitions: [cup] })).toEqual(cup);
  });
});

describe('sortedEditions — nedostajuća polja u poređenju', () => {
  const cupA = { id: 'a', competitionId: 'c2', competition: { name: 'Kup A', isLeague: false } };
  const cupB = { id: 'b', competitionId: 'c3', competition: { name: 'Kup B', isLeague: false } };
  const bezZastavice = { id: 'x', competitionId: 'c4', competition: { name: 'Kup X' } };
  const bezTakmicenja = { id: 'y', competitionId: 'c5' };

  const season = (competitions: unknown[]): CalendarSeason =>
    ({ id: 's', name: 'S', competitions }) as CalendarSeason;

  it('dva takmičenja bez `isLeague` porede se po nazivu', () => {
    expect(sortedEditions(season([cupB, cupA]))).toEqual([cupA, cupB]);
  });

  it('takmičenje bez `competition` ima prazan naziv i ide prvo', () => {
    // Ponašanje je posljedica `?? ''`: prazan naziv je leksikografski najmanji.
    expect(sortedEditions(season([bezTakmicenja, cupA]))).toEqual([bezTakmicenja, cupA]);
    expect(sortedEditions(season([cupA, bezTakmicenja]))).toEqual([bezTakmicenja, cupA]);
  });

  it('dvije nedostajuće zastavice porede se po nazivu', () => {
    expect(sortedEditions(season([bezZastavice, bezTakmicenja]))).toEqual([
      bezTakmicenja,
      bezZastavice,
    ]);
  });

  it('sezona bez takmičenja daje praznu listu', () => {
    expect(sortedEditions({ id: 's', name: 'S' })).toEqual([]);
    expect(sortedEditions()).toEqual([]);
  });
});
