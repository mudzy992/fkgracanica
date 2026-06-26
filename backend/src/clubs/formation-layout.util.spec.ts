import { lineYCentered, LINE_GRID_SLOTS } from './formation-layout.util';

describe('lineYCentered', () => {
  const y = (i: number, n: number) => lineYCentered(i, n);

  it('places 4 players across full grid', () => {
    expect(y(0, 4)).toBeCloseTo(12);
    expect(y(1, 4)).toBeCloseTo(37.333, 2);
    expect(y(2, 4)).toBeCloseTo(62.667, 2);
    expect(y(3, 4)).toBeCloseTo(88);
  });

  it('centers 3 players with middle on pitch center (aligned with GK)', () => {
    expect(y(0, 3)).toBe(12);
    expect(y(1, 3)).toBe(50);
    expect(y(2, 3)).toBe(88);
  });

  it('centers 2 players in slots 2 and 3 of 4', () => {
    const positions = [y(0, 2), y(1, 2)];
    expect(positions[0]).toBeCloseTo(12 + (76 / (LINE_GRID_SLOTS - 1)) * 1);
    expect(positions[1]).toBeCloseTo(12 + (76 / (LINE_GRID_SLOTS - 1)) * 2);
  });

  it('centers single outfield player on pitch center', () => {
    expect(y(0, 1)).toBe(50);
  });
});
