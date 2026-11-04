import { describe, expect, it } from 'vitest';
import { buildClubMatchLineup, excludeAssignedPlayers, playersIncludingSaved, retainUneditedLineupRows, slotsToLineupPayload } from './match-lineup-slots';
import type { MatchLineup, Player } from '../../../types';

const savedPlayer = { id: 'former', firstName: 'Bivši', lastName: 'Igrač', position: 'FWD', isActive: false, clubId: 'new-club' } as Player;
const saved: MatchLineup = {
  id: 'saved', playerId: 'former', clubId: 'home', isStarter: true,
  positionX: 71, positionY: 25, player: savedPlayer,
};
const reserve: MatchLineup = {
  id: 'reserve', playerId: 'reserve', clubId: 'home', isStarter: false, positionX: null, positionY: null,
};

describe('spremanje utakmične postave', () => {
  it('čuva originalne legacy koordinate za nepromijenjenog igrača, a za premještenog koristi novu poziciju', () => {
    const original = buildClubMatchLineup([saved], 'home', [], true);
    expect(slotsToLineupPayload(original, 'home', original, [saved])).toEqual([
      { playerId: 'former', clubId: 'home', positionX: 71, positionY: 25, isStarter: true },
    ]);
    const moved = original.map((slot, index) => ({ ...slot, playerId: index === 9 ? 'former' : '' }));
    expect(slotsToLineupPayload(moved, 'home', original, [saved])).toEqual([
      { playerId: 'former', clubId: 'home', positionX: 50, positionY: 22, isStarter: true },
    ]);
  });

  it('čuva null koordinate, rezerve i neprikazane startere, ali ne vraća uklonjene vidljive igrače', () => {
    const rows = [saved, reserve, { ...saved, id: 'extra', playerId: 'extra', positionX: null, positionY: null }];
    const original = buildClubMatchLineup([saved], 'home', [], true);
    expect(retainUneditedLineupRows(rows, original, [], ['home', 'away'])).toEqual([
      { playerId: 'reserve', clubId: 'home', isStarter: false },
      { playerId: 'extra', clubId: 'home', isStarter: true },
    ]);
    expect(retainUneditedLineupRows(rows, original, [{ playerId: 'reserve', clubId: 'home', isStarter: true }], ['home']))
      .toEqual([{ playerId: 'extra', clubId: 'home', isStarter: true }]);
  });

  it('ne dozvoljava istog igrača u obje ekipe ni duplo u jednoj', () => {
    const home = buildClubMatchLineup([saved], 'home', [], true);
    const away = home.map((slot) => ({ ...slot }));
    const index = away.findIndex((slot) => slot.playerId === 'former');
    away[0] = { ...away[0], playerId: 'duplicate' };
    away[1] = { ...away[1], playerId: 'duplicate' };
    const unique = excludeAssignedPlayers(away, home);
    expect(unique[index].playerId).toBe('');
    expect(unique.filter((slot) => slot.playerId === 'duplicate')).toHaveLength(1);
  });

  it('nudi sačuvanog neaktivnog ili transferisanog igrača i bez trenutne klupske liste', () => {
    expect(playersIncludingSaved([], [saved, saved], 'home')).toEqual([savedPlayer]);
    expect(playersIncludingSaved([], [saved], 'away')).toEqual([]);
  });
});
