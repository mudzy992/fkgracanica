import type { FormationSlot } from '../../../lib/formation-slots';

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

export { buildClubMatchLineup, hasSquadDefaults } from '../../../lib/match-lineup-from-squad';
