export const FORMATION_SLOTS = [
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

export type FormationSlot = (typeof FORMATION_SLOTS)[number] & { playerId: string };

export function buildFormationSlots(
  lineup?: { playerId: string; positionX?: number | null; positionY?: number | null }[],
): FormationSlot[] {
  return FORMATION_SLOTS.map((slot, i) => {
    const existing =
      lineup?.find((l) => l.positionX === slot.positionX && l.positionY === slot.positionY) ?? lineup?.[i];
    return { ...slot, playerId: existing?.playerId ?? '' };
  });
}
