import { describe, expect, it } from 'vitest';
import {
  buildMatchBody,
  emptyMatchValues,
  matchAdminStyles,
  matchFields,
} from '../components/staff/matches-admin';
import {
  buildPlayerBody,
  emptyPlayerValues,
  playerBaseFields,
  playerFieldsWithClubs,
} from '../components/staff/players-admin';

describe('mob-batch19 — P-MOB19 matches/players admin', () => {
  it('emptyMatchValues vraća defaults', () => {
    const v = emptyMatchValues();
    expect(v).toEqual({ homeClubId: '', awayClubId: '', scheduledAt: '', venue: '', seasonId: '' });
  });

  it('matchFields vraća 4 polja sa choice', () => {
    const choices = [{ value: 'c1', label: 'FK G' }];
    const fields = matchFields(choices);
    expect(fields.length).toBe(4);
    expect(fields[0].key).toBe('homeClubId');
    expect(fields[0].choices).toEqual(choices);
    expect(fields[1].key).toBe('awayClubId');
    expect(fields[2].key).toBe('scheduledAt');
    expect(fields[2].required).toBe(true);
    expect(fields[3].key).toBe('venue');
  });

  it('matchFields prazan choices', () => {
    const fields = matchFields([]);
    expect(fields[0].choices).toEqual([]);
    expect(fields[1].choices).toEqual([]);
  });

  it('buildMatchBody formatira scheduledAt u ISO i trim venue', () => {
    const iso = '2024-01-15T15:00:00.000Z';
    const body = buildMatchBody({ homeClubId: 'h1', awayClubId: 'a1', scheduledAt: '2024-01-15T15:00:00Z', venue: '  Stadion  ', seasonId: 's1' }, 's1');
    expect(body.seasonId).toBe('s1');
    expect(body.homeClubId).toBe('h1');
    expect(body.awayClubId).toBe('a1');
    expect(body.scheduledAt).toBe(iso);
    expect(body.venue).toBe('Stadion');
  });

  it('buildMatchBody venue prazno daje undefined', () => {
    const body = buildMatchBody({ homeClubId: 'h1', awayClubId: 'a1', scheduledAt: '2024-01-15T12:00:00Z', venue: '   ', seasonId: 's1' }, 's2');
    expect(body.venue).toBeUndefined();
    expect(body.seasonId).toBe('s2');
  });

  it('matchAdminStyles sadrži ključeve', () => {
    expect(matchAdminStyles.header.padding).toBe(16);
    expect(matchAdminStyles.row.borderRadius).toBe(10);
    expect(matchAdminStyles.chip.maxWidth).toBe(140);
  });

  it('emptyPlayerValues vraća defaults', () => {
    const v = emptyPlayerValues();
    expect(v).toEqual({ firstName: '', lastName: '', clubId: '', position: 'MID', number: '', bio: '' });
  });

  it('buildPlayerBody trim i number', () => {
    const body = buildPlayerBody({ firstName: '  Edin  ', lastName: ' Džeko ', clubId: 'c1', position: 'FWD', number: '9', bio: '  opis ' });
    expect(body.firstName).toBe('Edin');
    expect(body.lastName).toBe('Džeko');
    expect(body.clubId).toBe('c1');
    expect(body.position).toBe('FWD');
    expect(body.number).toBe(9);
    expect(body.bio).toBe('opis');
  });

  it('buildPlayerBody prazno number/club/bio daje undefined', () => {
    const body = buildPlayerBody({ firstName: 'A', lastName: 'B', clubId: '', position: '', number: '', bio: '   ' });
    expect(body.clubId).toBeUndefined();
    expect(body.position).toBeUndefined();
    expect(body.number).toBeUndefined();
    expect(body.bio).toBeUndefined();
  });

  it('buildPlayerBody number NaN kad nevažeći string', () => {
    const body = buildPlayerBody({ firstName: 'A', lastName: 'B', clubId: '', position: 'MID', number: 'abc', bio: '' });
    expect(Number.isNaN(body.number as number)).toBe(true);
  });

  it('playerFieldsWithClubs mapira klubove', () => {
    const clubs = [{ id: 'c1', name: 'FK G' }, { id: 'c2', name: 'FK X' }];
    const fields = playerFieldsWithClubs(clubs);
    const clubField = fields.find((f) => f.key === 'clubId');
    expect(clubField?.type).toBe('choice');
    expect(clubField?.choices).toEqual([{ value: 'c1', label: 'FK G' }, { value: 'c2', label: 'FK X' }]);
    const posField = fields.find((f) => f.key === 'position');
    expect(posField?.choices).toEqual(['GK', 'DEF', 'MID', 'FWD']);
  });

  it('playerFieldsWithClubs prazno vraća original', () => {
    const fields = playerFieldsWithClubs([]);
    const clubField = fields.find((f) => f.key === 'clubId');
    expect(clubField?.type).toBeUndefined();
    expect(fields.length).toBe(playerBaseFields.length);
    expect(playerBaseFields.map((f) => f.key)).toEqual(['firstName', 'lastName', 'clubId', 'position', 'number', 'bio']);
  });
});
