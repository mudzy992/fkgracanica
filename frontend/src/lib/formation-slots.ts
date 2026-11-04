import type { PlayerPosition } from '../types';

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

export type FormationSlot = {
  positionX: number;
  positionY: number;
  label: string;
  playerId: string;
  role?: PlayerPosition;
};

type LineupEntry = {
  playerId: string;
  positionX?: number | null;
  positionY?: number | null;
  preferredSlotIndex?: number;
  role?: PlayerPosition | null;
};

export function asPlayerPosition(value?: string | null): PlayerPosition | undefined {
  return value === 'GK' || value === 'DEF' || value === 'MID' || value === 'FWD' ? value : undefined;
}

const defaultRoles: PlayerPosition[] = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'];

export function validPitchCoordinates(x?: number | null, y?: number | null): boolean {
  return x != null && y != null && Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 100 && y >= 0 && y <= 100;
}

export function buildFormationSlots(
  lineup: LineupEntry[] = [],
  layout: Omit<FormationSlot, 'playerId'>[] = [...FORMATION_SLOTS],
): FormationSlot[] {
  const slots: FormationSlot[] = layout.map((slot) => ({ ...slot, playerId: '' }));
  const used = new Set<string>();
  const remaining: LineupEntry[] = [];

  // Rezerviši sve prepoznate koordinate prije dodjele legacy redova bez pozicije.
  for (const row of lineup) {
    if (!row.playerId) continue;
    const index = slots.findIndex((s) => s.positionX === row.positionX && s.positionY === row.positionY);
    if (index < 0 || slots[index].playerId || used.has(row.playerId)) {
      remaining.push(row);
      continue;
    }
    slots[index].playerId = row.playerId;
    used.add(row.playerId);
  }

  for (const row of remaining) {
    if (used.has(row.playerId)) continue;
    const preferred = row.preferredSlotIndex;
    let index = preferred != null && Number.isInteger(preferred) && preferred >= 0 && preferred < slots.length &&
      !slots[preferred].playerId ? preferred : -1;
    if (index < 0 && row.role) {
      index = slots.findIndex((slot, i) => !slot.playerId && (slot.role ?? defaultRoles[i]) === row.role);
    }
    if (index < 0) index = slots.findIndex((slot) => !slot.playerId);
    if (index < 0) break;
    // Prikaži stvarne spremljene koordinate i kada nisu dio trenutnog rasporeda.
    if (validPitchCoordinates(row.positionX, row.positionY) &&
      !slots.some((slot) => slot.positionX === row.positionX && slot.positionY === row.positionY)) {
      slots[index].positionX = row.positionX!;
      slots[index].positionY = row.positionY!;
    }
    slots[index].playerId = row.playerId;
    used.add(row.playerId);
  }
  return slots;
}
