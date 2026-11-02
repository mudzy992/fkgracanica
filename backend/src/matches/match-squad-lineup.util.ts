import type { Player } from '@prisma/client';
import { MATCH_FORMATION_SLOTS } from './match-formation-slots.util';

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

function adminSlotIndex(x: number, y: number) {
  return MATCH_FORMATION_SLOTS.findIndex(
    (s) => s.positionX === x && s.positionY === y,
  );
}

function squadStarters(squadSlots: SquadRow[]) {
  return squadSlots
    .filter((s) => !s.isBench && s.playerId)
    .sort((a, b) => a.slotIndex - b.slotIndex);
}

export function mergeClubLineupWithSquad(
  existing: LineupRow[],
  squadSlots: SquadRow[],
  clubId: string,
  matchId: string,
): LineupRow[] {
  const savedByIndex = new Map<number, LineupRow>();
  const savedByPlayer = new Map(existing.map((r) => [r.playerId, r]));
  for (const row of existing) {
    if (row.positionX == null || row.positionY == null) continue;
    const idx = adminSlotIndex(row.positionX, row.positionY);
    if (idx >= 0) savedByIndex.set(idx, row);
  }

  const usedPlayers = new Set<string>();
  const starters = squadStarters(squadSlots);
  const merged: LineupRow[] = [];

  starters.forEach((squadSlot, i) => {
    const saved =
      savedByIndex.get(i) ?? savedByPlayer.get(squadSlot.playerId ?? '');
    const playerId = saved?.playerId ?? squadSlot.playerId;
    if (!playerId || usedPlayers.has(playerId)) return;
    usedPlayers.add(playerId);

    merged.push({
      id: saved?.id ?? `squad-default-${clubId}-${squadSlot.slotIndex}`,
      matchId,
      clubId,
      playerId,
      positionX: squadSlot.positionX,
      positionY: squadSlot.positionY,
      isStarter: true,
      player: saved?.player ?? squadSlot.player ?? null,
    });
  });

  return merged;
}

export async function resolveEffectiveMatchLineup(
  prisma: {
    clubSquadSlot: { findMany: (args: object) => Promise<SquadRow[]> };
  },
  matchId: string,
  homeClubId: string,
  awayClubId: string,
  saved: LineupRow[],
) {
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

  const homeSaved = saved.filter((r) => r.clubId === homeClubId);
  const awaySaved = saved.filter((r) => r.clubId === awayClubId);

  return [
    ...mergeClubLineupWithSquad(homeSaved, homeSquad, homeClubId, matchId),
    ...mergeClubLineupWithSquad(awaySaved, awaySquad, awayClubId, matchId),
  ];
}
