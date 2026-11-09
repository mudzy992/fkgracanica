import { describe, expect, it } from 'vitest';
import {
  slotsToLineupPayload,
  excludeAssignedPlayers,
  retainUneditedLineupRows,
  playersIncludingSaved,
} from './match-lineup-slots';
import type { FormationSlot } from '../../../lib/formation-slots';

describe('match-lineup-slots — branch48 (2 grane ?? positionX/Y)', () => {
  it('slotsToLineupPayload sa saved position null → {} fallback (bid4 i bid5 [0,2])', () => {
    const slots = [{ playerId: 'p1', positionX: 50, positionY: 50 } as unknown as FormationSlot];
    const original = [{ playerId: 'p1', positionX: 50, positionY: 50 } as unknown as FormationSlot];
    const lineup = [
      { clubId: 'c1', playerId: 'p1', isStarter: true, id: 'row1', positionX: null, positionY: null } as never,
    ];
    const res = slotsToLineupPayload(slots, 'c1', original, lineup);
    expect(res).toEqual([{ playerId: 'p1', clubId: 'c1', isStarter: true }]);
  });

  it('slotsToLineupPayload sa saved position defined → {positionX} (druga grana)', () => {
    const slots = [{ playerId: 'p1', positionX: 50, positionY: 50 } as unknown as FormationSlot];
    const original = [{ playerId: 'p1', positionX: 50, positionY: 50 } as unknown as FormationSlot];
    const lineup = [
      { clubId: 'c1', playerId: 'p1', isStarter: true, id: 'row1', positionX: 66, positionY: 77 } as never,
    ];
    const res = slotsToLineupPayload(slots, 'c1', original, lineup);
    expect(res).toEqual([{ playerId: 'p1', clubId: 'c1', isStarter: true, positionX: 66, positionY: 77 }]);
  });

  it('slotsToLineupPayload parcijalno null (samo X null)', () => {
    const slots = [{ playerId: 'p1', positionX: 10, positionY: 20 } as unknown as FormationSlot];
    const original = [{ playerId: 'p1', positionX: 10, positionY: 20 } as unknown as FormationSlot];
    const lineup = [
      { clubId: 'c1', playerId: 'p1', isStarter: true, id: 'row1', positionX: null, positionY: 99 } as never,
    ];
    const res = slotsToLineupPayload(slots, 'c1', original, lineup);
    expect(res).toEqual([{ playerId: 'p1', clubId: 'c1', isStarter: true, positionY: 99 }]);
  });

  it('bez saved ili wasUnchanged false vraća direktno slot pozicije', () => {
    const slots = [{ playerId: 'p2', positionX: 11, positionY: 22 } as unknown as FormationSlot];
    const res1 = slotsToLineupPayload(slots, 'c1', undefined, undefined);
    expect(res1).toEqual([{ playerId: 'p2', clubId: 'c1', positionX: 11, positionY: 22, isStarter: true }]);

    const original = [{ playerId: 'p9', positionX: 0, positionY: 0 } as unknown as FormationSlot];
    const lineup = [{ clubId: 'c1', playerId: 'p1', isStarter: true, id: 'row1', positionX: 1, positionY: 1 } as never];
    const res2 = slotsToLineupPayload(slots, 'c1', original, lineup);
    expect(res2[0].positionX).toBe(11);
  });

  it('excludeAssignedPlayers i retainUneditedLineupRows basic', () => {
    const slots = [
      { playerId: 'p1' } as unknown as FormationSlot,
      { playerId: '' } as unknown as FormationSlot,
      { playerId: 'p1' } as unknown as FormationSlot,
    ];
    const other = [{ playerId: 'p1' } as unknown as FormationSlot];
    const filtered = excludeAssignedPlayers(slots, other);
    expect(filtered[0].playerId).toBe('');
    expect(filtered[1].playerId).toBe('');
    expect(filtered[2].playerId).toBe('');

    const lineup = [
      { clubId: 'c1', playerId: 'p5', isStarter: false, id: 'bench1' } as never,
      { clubId: 'c2', playerId: 'p6', isStarter: true, id: 'squad-default-1' } as never,
      { clubId: 'c1', playerId: 'p7', isStarter: true, id: 'starter1' } as never,
    ];
    const retained = retainUneditedLineupRows(lineup, [], [], ['c1']);
    expect(retained.length).toBeGreaterThan(0);
  });

  it('playersIncludingSaved dodaje nedostajuće', () => {
    const players = [{ id: 'p1' }] as never;
    const lineup = [
      { clubId: 'c1', playerId: 'p2', player: { id: 'p2' } } as never,
      { clubId: 'c2', playerId: 'p3', player: { id: 'p3' } } as never,
    ];
    const res = playersIncludingSaved(players as never, lineup as never, 'c1');
    expect(res.map((p: { id: string }) => p.id)).toContain('p2');
    expect(res.map((p: { id: string }) => p.id)).not.toContain('p3');
  });
});
