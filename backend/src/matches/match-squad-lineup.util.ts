import type { Player } from '@prisma/client';
import {
  MATCH_FORMATION_SLOTS,
  squadStartersByFormationIndex,
} from './match-formation-slots.util';

type LineupRow = {
  id: string;
  matchId: string;
  clubId: string;
  playerId: string;
  positionX: number | null;
  positionY: number | null;
  isStarter: boolean;
  player: Player | null;
  club?: unknown;
};

type SquadRow = {
  slotIndex: number;
  isBench: boolean;
  playerId: string | null;
  positionX: number;
  positionY: number;
  player?: Player | null;
};

function hasCompleteSquadLayout(squad: SquadRow[]): boolean {
  const starters = squad
    .filter(
      (s) =>
        !s.isBench &&
        Number.isInteger(s.slotIndex) &&
        s.slotIndex >= 0 &&
        s.slotIndex < 11,
    )
    .sort((a, b) => a.slotIndex - b.slotIndex);
  return (
    starters.length === 11 &&
    starters.every(
      (s, i) =>
        s.slotIndex === i &&
        Number.isFinite(s.positionX) &&
        Number.isFinite(s.positionY) &&
        s.positionX >= 0 &&
        s.positionX <= 100 &&
        s.positionY >= 0 &&
        s.positionY <= 100,
    ) &&
    new Set(starters.map((s) => `${s.positionX}:${s.positionY}`)).size === 11
  );
}

export function mergeClubLineupWithSquad(
  existing: LineupRow[],
  squadSlots: SquadRow[],
  clubId: string,
  matchId: string,
): LineupRow[] {
  // Spremljeni redovi nikad se ne filtriraju prema trenutnoj klupskoj postavi.
  if (existing.length) return existing;
  const useSquadLayout = hasCompleteSquadLayout(squadSlots);
  const used = new Set<string>();
  const result: LineupRow[] = [];
  for (const slot of squadStartersByFormationIndex(squadSlots)) {
    if (!slot.playerId || used.has(slot.playerId)) continue;
    used.add(slot.playerId);
    const position = MATCH_FORMATION_SLOTS[slot.slotIndex];
    result.push({
      id: `squad-default-${clubId}-${slot.slotIndex}`,
      matchId,
      clubId,
      playerId: slot.playerId,
      positionX: useSquadLayout ? slot.positionY : position.positionX,
      positionY: useSquadLayout ? 100 - slot.positionX : position.positionY,
      isStarter: true,
      player: slot.player ?? null,
    });
  }
  return result;
}

export async function resolveEffectiveMatchLineup(
  prisma: {
    clubSquadSlot: { findMany: (args: object) => Promise<SquadRow[]> };
  },
  matchId: string,
  homeClubId: string,
  awayClubId: string,
  saved: LineupRow[],
  lineupConfigured = false,
) {
  // Flag se odnosi na obje strane; prazna spremljena postava je autoritativna.
  if (lineupConfigured || saved.length) return saved;
  const [homeSquad, awaySquad] = await Promise.all([
    prisma.clubSquadSlot.findMany({
      where: { clubId: homeClubId },
      include: { player: true },
      orderBy: [{ isBench: 'asc' }, { slotIndex: 'asc' }],
    }),
    prisma.clubSquadSlot.findMany({
      where: { clubId: awayClubId },
      include: { player: true },
      orderBy: [{ isBench: 'asc' }, { slotIndex: 'asc' }],
    }),
  ]);

  const used = new Set<string>();
  return [
    ...mergeClubLineupWithSquad([], homeSquad, homeClubId, matchId),
    ...mergeClubLineupWithSquad([], awaySquad, awayClubId, matchId),
  ].filter((row) => {
    if (used.has(row.playerId)) return false;
    used.add(row.playerId);
    return true;
  });
}
