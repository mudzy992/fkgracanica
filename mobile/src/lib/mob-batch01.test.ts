import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import {
  activeSeasonCompetitions,
  pickDefaultParticipation,
  type ClubParticipation,
} from './club-participation';
import { asArray, asNumber, asRecord, asString } from './content-helpers';
import { hasAnyPermission, hasPermission, isStaffUser } from './permissions';

describe('mob-batch01 — P-MOB01 core lib', () => {
  it('getApiErrorMessage: axios string message', () => {
    const err = {
      isAxiosError: true,
      response: { data: { message: 'Greška' } },
    };
    expect(getApiErrorMessage(err as never, 'fallback')).toBe('Greška');
  });

  it('getApiErrorMessage: axios array message', () => {
    const err = { isAxiosError: true, response: { data: { message: ['a', 'b'] } } };
    expect(getApiErrorMessage(err as never, 'fb')).toBe('a, b');
  });

  it('getApiErrorMessage: Error sa message', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
  });

  it('getApiErrorMessage: nepoznata greška vraća fallback', () => {
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage({}, 'fallback')).toBe('fallback');
  });

  const base = (over: Partial<ClubParticipation> = {}): ClubParticipation => ({
    seasonId: 's1',
    seasonName: '2023/24',
    yearStart: 2023,
    isActive: true,
    competitionId: 'c1',
    competitionName: 'Premijer',
    isLeague: true,
    ...over,
  });

  it('pickDefaultParticipation: aktivna liga najnovija godina', () => {
    const items = [
      base({ seasonId: 'a', yearStart: 2021, isLeague: true }),
      base({ seasonId: 'b', yearStart: 2023, isLeague: true }),
      base({ seasonId: 'c', yearStart: 2022, isLeague: true, isActive: false }),
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('b');
  });

  it('pickDefaultParticipation: nema aktivne lige pa bira najnoviju aktivnu', () => {
    const items = [
      base({ seasonId: 'a', yearStart: 2020, isLeague: false }),
      base({ seasonId: 'b', yearStart: 2022, isLeague: false }),
      base({ seasonId: 'c', yearStart: 2021, isLeague: false, isActive: false }),
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('b');
  });

  it('pickDefaultParticipation: nema aktivnih pa bira najnoviju od svih', () => {
    const items = [
      base({ seasonId: 'a', yearStart: 2019, isActive: false }),
      base({ seasonId: 'b', yearStart: 2020, isActive: false }),
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('b');
  });

  it('pickDefaultParticipation: prazan niz vraća undefined', () => {
    expect(pickDefaultParticipation([])).toBeUndefined();
  });

  it('activeSeasonCompetitions: aktivne lige sortirane po isLeague pa nazivu', () => {
    const items = [
      base({ competitionName: 'Kup', isLeague: false, yearStart: 2023 }),
      base({ competitionName: 'Liga B', isLeague: true, yearStart: 2023 }),
      base({ competitionName: 'Liga A', isLeague: true, yearStart: 2023 }),
    ];
    const res = activeSeasonCompetitions(items);
    expect(res.map((r) => r.competitionName)).toEqual(['Liga A', 'Liga B', 'Kup']);
  });

  it('activeSeasonCompetitions: bez aktivnih koristi sve', () => {
    const items = [
      base({ competitionName: 'Kup', isLeague: false, isActive: false }),
      base({ competitionName: 'Liga', isLeague: true, isActive: false }),
    ];
    const res = activeSeasonCompetitions(items);
    expect(res.length).toBe(2);
  });

  it('content-helpers asRecord/asString/asNumber/asArray', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asRecord('x')).toEqual({});
    expect(asString('hi')).toBe('hi');
    expect(asString(123, 'fb')).toBe('fb');
    expect(asNumber(5)).toBe(5);
    expect(asNumber('5', 7)).toBe(7);
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray('x')).toEqual([]);
  });

  it('permissions: hasPermission/hasAnyPermission/isStaffUser', () => {
    const user = { permissions: ['users.read', 'cms.manage'] } as never;
    expect(hasPermission(user, 'users.read')).toBe(true);
    expect(hasPermission(user, 'missing')).toBe(false);
    expect(hasPermission(null, 'users.read')).toBe(false);
    expect(hasAnyPermission(user, ['missing', 'cms.manage'])).toBe(true);
    expect(hasAnyPermission(user, ['missing'])).toBe(false);
    expect(isStaffUser(user)).toBe(true);
    expect(isStaffUser({ permissions: [] } as never)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
  });
});
