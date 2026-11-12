import { BadRequestException } from '@nestjs/common';
import { PlayerPosition } from '@prisma/client';

export interface FormationCounts {
  def: number;
  mid: number;
  fwd: number;
}

export interface FormationSlotLayout {
  slotIndex: number;
  lineRole: PlayerPosition;
  positionX: number;
  positionY: number;
}

/** Virtual grid slots per line — players are centered within this grid. */
export const LINE_GRID_SLOTS = 4;

export function validateFormation(counts: FormationCounts): FormationCounts {
  const { def, mid, fwd } = counts;
  if (
    !Number.isInteger(def) ||
    !Number.isInteger(mid) ||
    !Number.isInteger(fwd)
  ) {
    throw new BadRequestException('Formacija mora sadržavati cijele brojeve.');
  }
  if (def < 1 || mid < 1 || fwd < 1) {
    throw new BadRequestException(
      'Svaka linija (odbrana, veznjaci, napad) mora imati najmanje 1 igrača.',
    );
  }
  if (def + mid + fwd > 10) {
    throw new BadRequestException(
      'Zbroj odbrane, veznjaka i napada ne smije biti veći od 10 (uz golmana).',
    );
  }
  return { def, mid, fwd };
}

/** Centers N players within LINE_GRID_SLOTS (e.g. 2 → slots 2 & 3 of 4). */
export function lineYCentered(
  indexInLine: number,
  countInLine: number,
): number {
  if (countInLine === 1) return 50;
  if (countInLine === 3) {
    return [12, 50, 88][indexInLine] ?? 50;
  }
  const start = Math.floor((LINE_GRID_SLOTS - countInLine) / 2);
  const slot = start + indexInLine;
  if (LINE_GRID_SLOTS <= 1) return 50;
  return 12 + (76 / (LINE_GRID_SLOTS - 1)) * slot;
}

function lineX(line: number): number {
  const lines = [14, 38, 62, 86];
  return lines[line] ?? 50;
}

export function buildFormationSlots(
  counts: FormationCounts,
): FormationSlotLayout[] {
  const { def, mid, fwd } = validateFormation(counts);
  const slots: FormationSlotLayout[] = [
    {
      slotIndex: 0,
      lineRole: PlayerPosition.GK,
      positionX: lineX(0),
      positionY: 50,
    },
  ];
  let idx = 1;
  for (let i = 0; i < def; i += 1) {
    slots.push({
      slotIndex: idx++,
      lineRole: PlayerPosition.DEF,
      positionX: lineX(1),
      positionY: lineYCentered(i, def),
    });
  }
  for (let i = 0; i < mid; i += 1) {
    slots.push({
      slotIndex: idx++,
      lineRole: PlayerPosition.MID,
      positionX: lineX(2),
      positionY: lineYCentered(i, mid),
    });
  }
  for (let i = 0; i < fwd; i += 1) {
    slots.push({
      slotIndex: idx++,
      lineRole: PlayerPosition.FWD,
      positionX: lineX(3),
      positionY: lineYCentered(i, fwd),
    });
  }
  return slots;
}

export const DEFAULT_BENCH_SIZE = 9;
