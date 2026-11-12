import { describe, it, expect } from 'vitest';
import { asPlayerPosition, buildFormationSlots, validPitchCoordinates, FORMATION_SLOTS } from './formation-slots';
import { mapPitchPosition } from './pitch-coords';

describe('fe06-batch69f formacije 15+ grana', () => {
  it('asPlayerPosition pokriva sve || i ternary', () => {
    expect(asPlayerPosition('GK')).toBe('GK');
    expect(asPlayerPosition('DEF')).toBe('DEF');
    expect(asPlayerPosition('MID')).toBe('MID');
    expect(asPlayerPosition('FWD')).toBe('FWD');
    expect(asPlayerPosition('UNKNOWN')).toBeUndefined();
    expect(asPlayerPosition('')).toBeUndefined();
    expect(asPlayerPosition(null)).toBeUndefined();
    expect(asPlayerPosition(undefined)).toBeUndefined();
    expect(asPlayerPosition('gk')).toBeUndefined();
  });

  it('validPitchCoordinates pokriva 8 && grana', () => {
    expect(validPitchCoordinates(50, 50)).toBe(true);
    expect(validPitchCoordinates(0, 0)).toBe(true);
    expect(validPitchCoordinates(100, 100)).toBe(true);
    expect(validPitchCoordinates(null, 50)).toBe(false);
    expect(validPitchCoordinates(50, null)).toBe(false);
    expect(validPitchCoordinates(undefined, 50)).toBe(false);
    expect(validPitchCoordinates(NaN, 50)).toBe(false);
    expect(validPitchCoordinates(50, NaN)).toBe(false);
    expect(validPitchCoordinates(Infinity, 50)).toBe(false);
    expect(validPitchCoordinates(50, Infinity)).toBe(false);
    expect(validPitchCoordinates(-1, 50)).toBe(false);
    expect(validPitchCoordinates(50, -1)).toBe(false);
    expect(validPitchCoordinates(101, 50)).toBe(false);
    expect(validPitchCoordinates(50, 101)).toBe(false);
    expect(validPitchCoordinates(-0.1, 50)).toBe(false);
    expect(validPitchCoordinates(50, 100.01)).toBe(false);
  });

  it('mapPitchPosition pokriva horizontal true/false', () => {
    expect(mapPitchPosition(30, 40, true)).toEqual({ left: 30, top: 40 });
    expect(mapPitchPosition(30, 40, false)).toEqual({ left: 40, top: 70 });
    expect(mapPitchPosition(0, 100, false)).toEqual({ left: 100, top: 100 });
  });

  it('buildFormationSlots default bez argumenata', () => {
    const slots = buildFormationSlots();
    expect(slots).toHaveLength(11);
    expect(slots.every(s => s.playerId === '')).toBe(true);
    const slots2 = buildFormationSlots([], [...FORMATION_SLOTS]);
    expect(slots2).toHaveLength(11);
  });

  it('buildFormationSlots !playerId continue i nepoznate koordinate', () => {
    const slots = buildFormationSlots([{ playerId: '' , positionX: 50, positionY: 90 } as never]);
    expect(slots.every(s => s.playerId === '')).toBe(true);
    const slots2 = buildFormationSlots([{ playerId: 'p1', positionX: 999, positionY: 999 }]);
    expect(slots2.some(s => s.playerId === 'p1')).toBe(true);
  });

  it('buildFormationSlots rezerviše tačne koordinate i preskače duplicirane', () => {
    const slots = buildFormationSlots([{ playerId: 'gk', positionX: 50, positionY: 90 }]);
    expect(slots[0].playerId).toBe('gk');
    const slots2 = buildFormationSlots([
      { playerId: 'gk', positionX: 50, positionY: 90 },
      { playerId: 'gk2', positionX: 50, positionY: 90 },
    ]);
    expect(slots2[0].playerId).toBe('gk');
    expect(slots2.some(s => s.playerId === 'gk2')).toBe(true);
    expect(slots2[0].playerId).not.toBe('gk2');
  });

  it('buildFormationSlots used.has duplicirani playerId u prvom krugu', () => {
    const slots = buildFormationSlots([
      { playerId: 'same', positionX: 50, positionY: 90 },
      { playerId: 'same', positionX: 20, positionY: 70 },
    ]);
    expect(slots.filter(s => s.playerId === 'same')).toHaveLength(1);
  });

  it('buildFormationSlots preferredSlotIndex grane', () => {
    const s1 = buildFormationSlots([{ playerId: 'p1', preferredSlotIndex: 0 }]);
    expect(s1[0].playerId).toBe('p1');
    const s2 = buildFormationSlots([
      { playerId: 'occupied', preferredSlotIndex: 0 },
      { playerId: 'p2', preferredSlotIndex: 0 },
    ]);
    expect(s2[0].playerId).toBe('occupied');
    expect(s2.some(s => s.playerId === 'p2')).toBe(true);
    expect(s2[0].playerId).not.toBe('p2');
    const s3 = buildFormationSlots([{ playerId: 'p3', preferredSlotIndex: -1 }]);
    expect(s3.some(s => s.playerId === 'p3')).toBe(true);
    const s4 = buildFormationSlots([{ playerId: 'p4', preferredSlotIndex: 99 }]);
    expect(s4.some(s => s.playerId === 'p4')).toBe(true);
    const s5 = buildFormationSlots([{ playerId: 'p5', preferredSlotIndex: 1.5 as never }]);
    expect(s5.some(s => s.playerId === 'p5')).toBe(true);
    const s6 = buildFormationSlots([{ playerId: 'p6' } as never]);
    expect(s6.some(s => s.playerId === 'p6')).toBe(true);
  });
});
