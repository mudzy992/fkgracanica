import { describe, expect, it } from 'vitest';
import { clubShortName } from './club-display-name';
import { asArray } from './as-array';
import { getApiErrorMessage } from './api-error';
import { clubCrestPath } from './club-utils';
import { contentStatusLabel } from './content-status-labels';

describe('fe06-batch49 — 99.5%→100% (+15 grana)', () => {
  it('clubShortName: shortName postoji vraća upper', () => {
    expect(clubShortName({ shortName: '  fkg  ', name: 'FK Gračanica' })).toBe('FKG');
    expect(clubShortName({ shortName: 'ab', name: 'A' }, 2)).toBe('AB');
  });
  it('clubShortName: shortName prazan fallback na name', () => {
    expect(clubShortName({ shortName: '   ', name: 'FK Gračanica' })).toBe('FK');
    expect(clubShortName({ shortName: undefined, name: '  Gračanica  ' })).toBe('GRAČ');
  });
  it('clubShortName: club null/undefined vraća ?', () => {
    expect(clubShortName(null)).toBe('?');
    expect(clubShortName(undefined)).toBe('?');
    expect(clubShortName({} as never)).toBe('?');
    expect(clubShortName({ name: '   ' } as never)).toBe('');
  });
  it('clubShortName: name sa više riječi uzima prvu', () => {
    expect(clubShortName({ name: 'FK Gračanica Doboj' })).toBe('FK');
    expect(clubShortName({ name: '  NK   Čelik  ' })).toBe('NK');
  });
  it('clubShortName: maxLen poštuje limit', () => {
    expect(clubShortName({ name: 'Gračanica' }, 3)).toBe('GRA');
    expect(clubShortName({ name: 'A' }, 10)).toBe('A');
  });
  it('asArray: niz vraća isti', () => {
    expect(asArray<number>([1, 2])).toEqual([1, 2]);
  });
  it('asArray: null/string vraća prazan', () => {
    expect(asArray(null)).toEqual([]);
    expect(asArray(undefined)).toEqual([]);
    expect(asArray('string')).toEqual([]);
  });
  it('asArray: ne-objekat vraća prazan', () => {
    expect(asArray(42 as never)).toEqual([]);
    expect(asArray(true as never)).toEqual([]);
  });
  it('asArray: objekat sa data rekurzivno', () => {
    expect(asArray<number>({ data: [3, 4] } as never)).toEqual([3, 4]);
    expect(asArray<number>({ data: { data: [5] } } as never)).toEqual([5]);
  });
  it('asArray: objekat sa items', () => {
    expect(asArray<number>({ items: [6, 7] } as never)).toEqual([6, 7]);
  });
  it('asArray: objekat sa results fallback i prazan', () => {
    expect(asArray<number>({ results: [8] } as never)).toEqual([8]);
    expect(asArray({ foo: 'bar' } as never)).toEqual([]);
  });
  it('getApiErrorMessage: axios string message', () => {
    const err = { isAxiosError: true, response: { data: { message: 'Greška' } } } as never;
    expect(getApiErrorMessage(err, 'fallback')).toBe('Greška');
  });
  it('getApiErrorMessage: axios array message', () => {
    const err = { isAxiosError: true, response: { data: { message: ['a', 'b'] } } } as never;
    expect(getApiErrorMessage(err, 'fallback')).toBe('a, b');
  });
  it('getApiErrorMessage: Error sa message vraća message', () => {
    expect(getApiErrorMessage(new Error('My error'), 'fallback')).toBe('My error');
    expect(getApiErrorMessage(new Error(''), 'fallback')).toBe('fallback');
  });
  it('getApiErrorMessage: nepoznata greška vraća fallback', () => {
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage({}, 'fb')).toBe('fb');
  });
  it('clubCrestPath: vraća crestPath ili logoPath ili null', () => {
    expect(clubCrestPath({ crestPath: '/a.png', logoPath: '/b.png' } as never)).toBe('/a.png');
    expect(clubCrestPath({ crestPath: null, logoPath: '/b.png' } as never)).toBe('/b.png');
    expect(clubCrestPath({ crestPath: null, logoPath: null } as never)).toBeNull();
    expect(clubCrestPath(null)).toBeNull();
  });
  it('contentStatusLabel: poznat status vraća labelu', () => {
    expect(contentStatusLabel('DRAFT')).toBe('Nacrt');
    expect(contentStatusLabel('PUBLISHED')).toBe('Objavljeno');
  });
  it('contentStatusLabel: nepoznat status vraća sam status', () => {
    expect(contentStatusLabel('UNKNOWN')).toBe('UNKNOWN');
    expect(contentStatusLabel('')).toBe('');
  });
});
