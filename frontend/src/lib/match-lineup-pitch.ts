import type { ClubSquadSlot } from '../types/club-hub';
import type { MatchLineup, PlayerPosition } from '../types';

/** Public pitch uses club squad grid coords, not admin match-editor coords. */
export function matchLineupToPitchSlots(
  lineup: MatchLineup[],
  clubId: string,
  squad?: ClubSquadSlot[],
): ClubSquadSlot[] {
  const squadByPlayer = new Map(
    (squad ?? [])
      .filter((s) => !s.isBench && s.playerId)
      .map((s) => [s.playerId!, s]),
  );

  const out: ClubSquadSlot[] = [];

  for (const l of lineup) {
    if (l.clubId !== clubId || !l.isStarter || !l.playerId || !l.player) continue;
    const squadSlot = squadByPlayer.get(l.playerId);
    if (!squadSlot) continue;
    out.push({
      id: l.id,
      clubId: l.clubId,
      slotIndex: squadSlot.slotIndex,
      lineRole: squadSlot.lineRole ?? ((l.player.position ?? 'MID') as PlayerPosition),
      positionX: squadSlot.positionX,
      positionY: squadSlot.positionY,
      isBench: false,
      playerId: l.playerId,
      player: l.player ?? squadSlot.player ?? null,
    });
  }

  return out.sort((a, b) => a.slotIndex - b.slotIndex);
}
