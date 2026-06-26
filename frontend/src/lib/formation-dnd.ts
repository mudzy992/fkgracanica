import type { ClubSquadSlot } from '../types/club-hub';

export type SquadAssignment = { slotIndex: number; isBench: boolean; playerId?: string | null };

export function squadSlotDndId(slot: Pick<ClubSquadSlot, 'slotIndex' | 'isBench'>): string {
  return slot.isBench ? `slot-b-${slot.slotIndex}` : `slot-s-${slot.slotIndex}`;
}

export function playerDndId(playerId: string): string {
  return `player-${playerId}`;
}

export function parseDndId(id: string) {
  if (id.startsWith('player-')) return { kind: 'player' as const, playerId: id.slice(7) };
  const m = id.match(/^slot-([sb])-(\d+)$/);
  if (!m) return null;
  return { kind: 'slot' as const, isBench: m[1] === 'b', slotIndex: Number(m[2]) };
}

export function findSquadSlot(slots: ClubSquadSlot[], isBench: boolean, slotIndex: number) {
  return slots.find((s) => s.isBench === isBench && s.slotIndex === slotIndex);
}

export function buildSwapAssignments(
  slots: ClubSquadSlot[],
  target: Pick<ClubSquadSlot, 'slotIndex' | 'isBench'>,
  playerId: string,
  source?: Pick<ClubSquadSlot, 'slotIndex' | 'isBench'> | null,
): SquadAssignment[] {
  const targetSlot = findSquadSlot(slots, target.isBench, target.slotIndex);
  const displacedId = targetSlot?.playerId ?? null;
  const assignments: SquadAssignment[] = [
    { slotIndex: target.slotIndex, isBench: target.isBench, playerId },
  ];
  if (source) {
    assignments.push({
      slotIndex: source.slotIndex,
      isBench: source.isBench,
      playerId: displacedId,
    });
    return assignments;
  }
  const other = slots.find((s) => s.playerId === playerId);
  if (other && (other.slotIndex !== target.slotIndex || other.isBench !== target.isBench)) {
    assignments.push({
      slotIndex: other.slotIndex,
      isBench: other.isBench,
      playerId: displacedId,
    });
  }
  return assignments;
}

export function resolveDragAssignments(
  slots: ClubSquadSlot[],
  activeId: string,
  overId: string,
): SquadAssignment[] | null {
  const active = parseDndId(activeId);
  const over = parseDndId(overId);
  if (!active || !over || over.kind !== 'slot') return null;

  let playerId: string | null = null;
  let source: Pick<ClubSquadSlot, 'slotIndex' | 'isBench'> | null = null;

  if (active.kind === 'player') {
    playerId = active.playerId;
  } else {
    const from = findSquadSlot(slots, active.isBench, active.slotIndex);
    playerId = from?.playerId ?? null;
    if (!playerId) return null;
    source = { slotIndex: active.slotIndex, isBench: active.isBench };
  }

  return buildSwapAssignments(slots, over, playerId, source);
}
