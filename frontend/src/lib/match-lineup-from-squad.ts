import { MATCH_FORMATION_SLOTS, squadStartersByFormationIndex } from './match-formation-slots';
import type { ClubSquadSlot } from '../types/club-hub';
import type { MatchLineup } from '../types';
import { asPlayerPosition, buildFormationSlots, FORMATION_SLOTS, validPitchCoordinates, type FormationSlot } from './formation-slots';

/** Klupski horizontalni teren rotiraj u vertikalni urednik utakmice. */
export function buildSquadFormationLayout(squad: ClubSquadSlot[]): Omit<FormationSlot, 'playerId'>[] | undefined {
  const starters = squad.filter((s) => !s.isBench && Number.isInteger(s.slotIndex) && s.slotIndex >= 0 && s.slotIndex < 11)
    .sort((a, b) => a.slotIndex - b.slotIndex);
  if (starters.length !== 11 || starters.some((s, i) => s.slotIndex !== i || !validPitchCoordinates(s.positionX, s.positionY))) return undefined;
  if (new Set(starters.map((s) => `${s.positionX}:${s.positionY}`)).size !== 11) return undefined;
  return starters.map((s) => ({
    positionX: s.positionY, positionY: 100 - s.positionX, label: s.lineRole, role: s.lineRole,
  }));
}

export function squadToLineupInputs(squad: ClubSquadSlot[]) {
  const layout = buildSquadFormationLayout(squad);
  return squadStartersByFormationIndex(squad).map((slot) => ({
    playerId: slot.playerId!,
    positionX: (layout ?? MATCH_FORMATION_SLOTS)[slot.slotIndex].positionX,
    positionY: (layout ?? MATCH_FORMATION_SLOTS)[slot.slotIndex].positionY,
  }));
}

export function buildClubMatchLineup(
  lineup: MatchLineup[] | undefined,
  clubId: string,
  squad?: ClubSquadSlot[],
  lineupConfigured?: boolean,
): FormationSlot[] {
  const rows = (lineup ?? []).filter((row) => row.clubId === clubId && row.isStarter);
  const layout = buildSquadFormationLayout(squad ?? []);
  // Stariji odgovori nemaju flag; svaki stvarni spremljeni red čuva prednost.
  const hasSaved = (lineup ?? []).some((row) => !row.id?.startsWith('squad-default-'));
  if (!lineupConfigured && !hasSaved && squad?.length) {
    return buildFormationSlots(squadToLineupInputs(squad), layout);
  }

  const indexByPlayer = new Map(
    squadStartersByFormationIndex(squad ?? []).map((slot) => [slot.playerId, slot.slotIndex]),
  );
  return buildFormationSlots(rows.map((row) => {
    const fixedIndex = FORMATION_SLOTS.findIndex((s) => s.positionX === row.positionX && s.positionY === row.positionY);
    const defaultIndex = row.id?.startsWith('squad-default-') ? Number(row.id.split('-').at(-1)) : undefined;
    return {
      playerId: row.playerId,
      positionX: row.positionX,
      positionY: row.positionY,
      preferredSlotIndex: fixedIndex >= 0 ? fixedIndex : indexByPlayer.get(row.playerId) ?? defaultIndex,
      role: asPlayerPosition(row.player?.position),
    };
  }), layout);
}

export function hasSquadDefaults(lineup: MatchLineup[] | undefined) {
  return (lineup ?? []).some((row) => row.id?.startsWith('squad-default-'));
}

/** Lokalni fallback samo prije prvog spremanja (npr. squad se inicijalizuje nakon GET utakmice). */
export function resolvePublicMatchLineup(
  lineup: MatchLineup[],
  lineupConfigured: boolean | undefined,
  teams: { clubId: string; squad?: ClubSquadSlot[] }[],
): MatchLineup[] {
  if (lineupConfigured || lineup.some((row) => !row.id?.startsWith('squad-default-'))) return lineup;
  const result = [...lineup];
  const used = new Set(result.map((row) => row.playerId));
  for (const { clubId, squad = [] } of teams) {
    if (lineup.some((row) => row.clubId === clubId)) continue;
    const layout = buildSquadFormationLayout(squad);
    for (const slot of squadStartersByFormationIndex(squad)) {
      if (!slot.playerId || used.has(slot.playerId)) continue;
      const position = (layout ?? MATCH_FORMATION_SLOTS)[slot.slotIndex];
      result.push({
        id: `squad-default-${clubId}-${slot.slotIndex}`,
        clubId,
        playerId: slot.playerId,
        positionX: position.positionX,
        positionY: position.positionY,
        isStarter: true,
        player: slot.player,
      });
      used.add(slot.playerId);
    }
  }
  return result;
}
