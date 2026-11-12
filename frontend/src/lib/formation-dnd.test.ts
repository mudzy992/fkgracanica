import { describe, expect, it } from 'vitest';
import type { ClubSquadSlot } from '../types/club-hub';
import { buildSwapAssignments, findSquadSlot, parseDndId, playerDndId, resolveDragAssignments, squadSlotDndId } from './formation-dnd';

const slot = (slotIndex: number, isBench: boolean, playerId: string | null): ClubSquadSlot => ({
  id: `${isBench}-${slotIndex}`, clubId: 'club', slotIndex, isBench, playerId,
  lineRole: 'MID', positionX: 50, positionY: 50,
});
const slots = [slot(0, false, 'a'), slot(1, false, null), slot(0, true, 'b')];

describe('dodjela klupske postave', () => {
  it('formatira i parsira ID-jeve, uključujući klupu, te odbacuje neispravne ciljeve', () => {
    expect(squadSlotDndId(slots[0])).toBe('slot-s-0');
    expect(squadSlotDndId(slots[2])).toBe('slot-b-0');
    expect(parseDndId(playerDndId('player-7'))).toEqual({ kind: 'player', playerId: 'player-7' });
    expect(parseDndId('slot-b-17')).toEqual({ kind: 'slot', isBench: true, slotIndex: 17 });
    expect(parseDndId('slot-s--1')).toBeNull();
    expect(parseDndId('unknown')).toBeNull();
    expect(findSquadSlot(slots, true, 0)?.playerId).toBe('b');
  });

  it('pri zamjeni zauzetih mjesta vraća oba igrača na odgovarajuća mjesta', () => {
    expect(resolveDragAssignments(slots, 'player-a', 'slot-b-0')).toEqual([
      { slotIndex: 0, isBench: true, playerId: 'a' },
      { slotIndex: 0, isBench: false, playerId: 'b' },
    ]);
  });

  it('prebacivanje na prazno mjesto oslobađa prethodno; novi igrač ne proizvodi lažni izvor', () => {
    expect(resolveDragAssignments(slots, 'player-a', 'slot-s-1')).toEqual([
      { slotIndex: 1, isBench: false, playerId: 'a' },
      { slotIndex: 0, isBench: false, playerId: null },
    ]);
    expect(buildSwapAssignments(slots, slots[1], 'new')).toEqual([{ slotIndex: 1, isBench: false, playerId: 'new' }]);
    expect(buildSwapAssignments(slots, slots[0], 'a')).toEqual([{ slotIndex: 0, isBench: false, playerId: 'a' }]);
  });

  it('ne šalje dodjelu s praznog mjesta ili prema neispravnom cilju', () => {
    expect(resolveDragAssignments(slots, 'slot-s-1', 'slot-b-0')).toBeNull();
    expect(resolveDragAssignments(slots, 'player-a', 'player-b')).toBeNull();
    expect(resolveDragAssignments(slots, 'invalid', 'slot-b-0')).toBeNull();
  });

  it('prevlačenje zauzetog mjesta zamjenjuje oba igrača', () => {
    expect(resolveDragAssignments(slots, squadSlotDndId(slots[0]), squadSlotDndId(slots[2]))).toEqual([
      { slotIndex: 0, isBench: true, playerId: 'a' },
      { slotIndex: 0, isBench: false, playerId: 'b' },
    ]);
  });
});
