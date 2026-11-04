import type { MatchLineup, Player } from '../../../types';
import type { FormationSlot } from '../../../lib/formation-slots';

export type LineupPayload = {
  playerId: string;
  clubId: string;
  positionX?: number;
  positionY?: number;
  isStarter: boolean;
};

export function slotsToLineupPayload(
  slots: FormationSlot[],
  clubId: string,
  originalSlots?: FormationSlot[],
  lineup?: MatchLineup[],
): LineupPayload[] {
  return slots.filter((slot) => slot.playerId).map((slot) => {
    const wasUnchanged = originalSlots?.some((original) => original.playerId === slot.playerId &&
      original.positionX === slot.positionX && original.positionY === slot.positionY);
    const saved = wasUnchanged && lineup?.find((row) => row.clubId === clubId && row.playerId === slot.playerId &&
      row.isStarter && !row.id.startsWith('squad-default-'));
    if (saved) return {
      playerId: slot.playerId, clubId, isStarter: true,
      ...(saved.positionX == null ? {} : { positionX: saved.positionX }),
      ...(saved.positionY == null ? {} : { positionY: saved.positionY }),
    };
    return { playerId: slot.playerId, clubId, positionX: slot.positionX, positionY: slot.positionY, isStarter: true };
  });
}


/** Jedan igrač ne može zauzimati više mjesta, ni u suprotnoj ekipi. */
export function excludeAssignedPlayers(slots: FormationSlot[], otherSlots: FormationSlot[]): FormationSlot[] {
  const used = new Set(otherSlots.map((slot) => slot.playerId).filter(Boolean));
  return slots.map((slot) => {
    if (!slot.playerId) return slot;
    if (used.has(slot.playerId)) return { ...slot, playerId: '' };
    used.add(slot.playerId);
    return slot;
  });
}

/** Zadrži rezerve i eventualne startere koje mreža od 11 mjesta ne može prikazati. */
export function retainUneditedLineupRows(
  lineup: MatchLineup[] | undefined,
  originalSlots: FormationSlot[],
  selected: LineupPayload[],
  clubIds: string[],
): LineupPayload[] {
  const visible = new Set(originalSlots.map((slot) => slot.playerId).filter(Boolean));
  const used = new Set(selected.map((slot) => slot.playerId));
  const result: LineupPayload[] = [];
  for (const row of lineup ?? []) {
    if (!clubIds.includes(row.clubId) || row.id.startsWith('squad-default-') || used.has(row.playerId)) continue;
    if (row.isStarter && visible.has(row.playerId)) continue;
    used.add(row.playerId);
    result.push({
      playerId: row.playerId,
      clubId: row.clubId,
      isStarter: row.isStarter,
      ...(row.positionX == null ? {} : { positionX: row.positionX }),
      ...(row.positionY == null ? {} : { positionY: row.positionY }),
    });
  }
  return result;
}

/** U editoru prikaži i spremljene igrače koji više nisu na aktivnoj listi kluba. */
export function playersIncludingSaved(players: Player[], lineup: MatchLineup[] | undefined, clubId: string): Player[] {
  const result = [...players];
  const seen = new Set(players.map((player) => player.id));
  for (const row of lineup ?? []) {
    if (row.clubId !== clubId || !row.player || seen.has(row.playerId)) continue;
    seen.add(row.playerId);
    result.push(row.player);
  }
  return result;
}

export { buildClubMatchLineup, hasSquadDefaults } from '../../../lib/match-lineup-from-squad';
