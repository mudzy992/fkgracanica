import type { ClubSquadSlot } from '../types/club-hub';
import type { MatchLineup, PlayerPosition } from '../types';
import { buildClubMatchLineup, buildSquadFormationLayout } from './match-lineup-from-squad';
import { asPlayerPosition } from './formation-slots';

/** Pretvara vertikalne koordinate utakmice u horizontalni klupski teren. */
export function matchLineupToPitchSlots(
  lineup: MatchLineup[],
  clubId: string,
  squad?: ClubSquadSlot[],
): ClubSquadSlot[] {
  const rows = lineup.filter((row) => row.clubId === clubId && row.isStarter && row.playerId && row.player);
  const byPlayer = new Map(rows.map((row) => [row.playerId, row]));
  const useSquadLayout = !!squad && !!buildSquadFormationLayout(squad);
  const squadByPlayer = new Map(
    (squad ?? []).filter((slot) => !slot.isBench && slot.playerId).map((slot) => [slot.playerId!, slot]),
  );

  return buildClubMatchLineup(rows, clubId, squad, true).flatMap((slot, slotIndex) => {
    const row = byPlayer.get(slot.playerId);
    if (!row?.player) return [];
    const squadSlot = squadByPlayer.get(row.playerId);
    const isDefault = row.id.startsWith('squad-default-');
    const role: PlayerPosition = asPlayerPosition(row.player.position) ?? squadSlot?.lineRole ?? 'MID';
    const hasMatchPosition = row.positionX != null && row.positionY != null &&
      Number.isFinite(row.positionX) && Number.isFinite(row.positionY) &&
      row.positionX >= 0 && row.positionX <= 100 && row.positionY >= 0 && row.positionY <= 100;
    const matchX = hasMatchPosition ? row.positionX! : slot.positionX;
    const matchY = hasMatchPosition ? row.positionY! : slot.positionY;
    return [{
      id: row.id,
      clubId: row.clubId,
      slotIndex,
      lineRole: role,
      positionX: isDefault && squadSlot && useSquadLayout ? squadSlot.positionX : 100 - matchY,
      positionY: isDefault && squadSlot && useSquadLayout ? squadSlot.positionY : matchX,
      isBench: false,
      playerId: row.playerId,
      player: row.player,
    }];
  });
}
