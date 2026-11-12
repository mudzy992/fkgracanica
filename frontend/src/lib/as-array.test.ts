import { describe, expect, it } from 'vitest';
import { asArray } from './as-array';

describe('asArray (FE-02)', () => {
  it('propušta niz nepromijenjen', () => {
    const rows = [{ id: 1 }];
    expect(asArray(rows)).toBe(rows);
  });

  it('raspakuje paginirane oblike (data/items/results)', () => {
    expect(asArray<number>({ data: [1, 2] })).toEqual([1, 2]);
    expect(asArray<number>({ items: [3] })).toEqual([3]);
    expect(asArray<number>({ results: [4] })).toEqual([4]);
  });

  it('rekurzivno ulazi kroz data omotač', () => {
    expect(asArray<number>({ data: { items: [5, 6] } })).toEqual([5, 6]);
  });

  it('vraća prazan niz za primitive, null i nepoznate objekte', () => {
    expect(asArray(null)).toEqual([]);
    expect(asArray(undefined)).toEqual([]);
    expect(asArray('tekst')).toEqual([]);
    expect(asArray(42)).toEqual([]);
    expect(asArray({ total: 3 })).toEqual([]);
  });
});
