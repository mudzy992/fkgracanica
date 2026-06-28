import { MATCH_FORMATION_SLOTS, squadStartersByFormationIndex } from './match-formation-slots';
import type { ClubSquadSlot } from '../types/club-hub';
import type { MatchLineup } from '../types';
import { buildFormationSlots, type FormationSlot } from './formation-slots';

function adminSlotIndex(x?: number | null, y?: number | null) {
  if (x == null || y == null) return -1;
  return MATCH_FORMATION_SLOTS.findIndex((s) => s.positionX === x && s.positionY === y);
}

export function squadToLineupInputs(squad: ClubSquadSlot[]) {
  return squadStartersByFormationIndex(squad).map((s) => {
    const slot = s as ClubSquadSlot;
    return {
      playerId: slot.playerId!,
      positionX: slot.positionX,
      positionY: slot.positionY,
    };
  });
}

export function buildClubMatchLineup(
  lineup: MatchLineup[] | undefined,
  clubId: string,
  squad?: ClubSquadSlot[],
): FormationSlot[] {
  const rows = (lineup ?? []).filter((l) => l.clubId === clubId || l.player?.clubId === clubId);
  const fromSaved = buildFormationSlots(
    rows.map((r) => ({
      playerId: r.playerId,
      positionX: r.positionX,
      positionY: r.positionY,
    })),
  );

  if (!squad?.length) return fromSaved;

  const squadStarters = squadStartersByFormationIndex(squad);
  const savedByIndex = new Map<number, MatchLineup>();
  for (const row of rows) {
    const idx = adminSlotIndex(row.positionX, row.positionY);
    if (idx >= 0) savedByIndex.set(idx, row);
  }

  const used = new Set<string>();

  return fromSaved.map((slot, i) => {
    const saved = savedByIndex.get(i);
    if (saved?.playerId && !used.has(saved.playerId)) {
      used.add(saved.playerId);
      return { ...slot, playerId: saved.playerId };
    }
    if (slot.playerId && !used.has(slot.playerId)) {
      used.add(slot.playerId);
      return slot;
    }
    const pick = squadStarters[i];
    if (!pick?.playerId || used.has(pick.playerId)) return slot;
    used.add(pick.playerId);
    return { ...slot, playerId: pick.playerId };
  });
}

export function hasSquadDefaults(lineup: MatchLineup[] | undefined) {
  return (lineup ?? []).some((r) => r.id.startsWith('squad-default-'));
}
