import { buildFormationSlots, type FormationSlot } from '../../../lib/formation-slots';
import type { MatchLineup } from '../../../types';

export function buildClubMatchLineup(lineup: MatchLineup[] | undefined, clubId: string): FormationSlot[] {
  const rows = (lineup ?? []).filter((l) => l.clubId === clubId || l.player?.clubId === clubId);
  return buildFormationSlots(
    rows.map((r) => ({
      playerId: r.playerId,
      positionX: r.positionX,
      positionY: r.positionY,
    })),
  );
}

export function slotsToLineupPayload(
  slots: FormationSlot[],
  clubId: string,
): { playerId: string; clubId: string; positionX: number; positionY: number; isStarter: boolean }[] {
  return slots
    .filter((s) => s.playerId)
    .map((s) => ({
      playerId: s.playerId,
      clubId,
      positionX: s.positionX,
      positionY: s.positionY,
      isStarter: true,
    }));
}
