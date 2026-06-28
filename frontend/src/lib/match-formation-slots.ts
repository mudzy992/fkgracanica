/** Fixed 4-3-3 pitch grid — keep in sync with backend match-formation-slots.util.ts */
export const MATCH_FORMATION_SLOTS = [
  { positionX: 50, positionY: 90, label: 'GK' },
  { positionX: 20, positionY: 70, label: 'LB' },
  { positionX: 40, positionY: 72, label: 'CB' },
  { positionX: 60, positionY: 72, label: 'CB' },
  { positionX: 80, positionY: 70, label: 'RB' },
  { positionX: 30, positionY: 50, label: 'CM' },
  { positionX: 50, positionY: 48, label: 'CM' },
  { positionX: 70, positionY: 50, label: 'CM' },
  { positionX: 25, positionY: 28, label: 'LW' },
  { positionX: 50, positionY: 22, label: 'ST' },
  { positionX: 75, positionY: 28, label: 'RW' },
] as const;

export type SquadSlotLike = {
  slotIndex: number;
  isBench: boolean;
  playerId?: string | null;
};

export function squadStartersByFormationIndex(slots: SquadSlotLike[]) {
  return slots
    .filter((s) => !s.isBench && s.playerId)
    .sort((a, b) => a.slotIndex - b.slotIndex)
    .slice(0, MATCH_FORMATION_SLOTS.length);
}
