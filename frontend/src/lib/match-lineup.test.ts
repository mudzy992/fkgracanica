import { describe, expect, it } from 'vitest';
import { buildFormationSlots, FORMATION_SLOTS } from './formation-slots';
import { buildClubMatchLineup, buildSquadFormationLayout, resolvePublicMatchLineup, squadToLineupInputs } from './match-lineup-from-squad';
import { matchLineupToPitchSlots } from './match-lineup-pitch';
import { mapPitchPosition } from './pitch-coords';
import type { MatchLineup, Player } from '../types';
import type { ClubSquadSlot } from '../types/club-hub';

const player = (id: string, position: Player['position'] = 'FWD', clubId = 'home') =>
  ({ id, firstName: 'Test', lastName: id, position, clubId } as Player);
const row = (id: string, x: number | null, y: number | null, extra: Partial<MatchLineup> = {}): MatchLineup => ({
  id: `saved-${id}`, playerId: id, clubId: 'home', positionX: x, positionY: y, isStarter: true,
  player: player(id), ...extra,
});
const squadSlot = (index: number, id: string | null, extra: Partial<ClubSquadSlot> = {}): ClubSquadSlot => ({
  id: `squad-${index}`, clubId: 'home', slotIndex: index, isBench: false, playerId: id,
  player: id ? player(id) : null, positionX: 86, positionY: 88, lineRole: 'FWD', ...extra,
});
const assigned = (slots: ReturnType<typeof buildFormationSlots>) => slots.map((s) => s.playerId).filter(Boolean);

describe('postava utakmice i klupski predložak', () => {
  it('sačuvani igrač na RW ne popunjava praznog golmana i ne duplicira se', () => {
    const slots = buildFormationSlots([{ playerId: 'wing', positionX: 75, positionY: 28 }]);
    expect(slots[0].playerId).toBe('');
    expect(slots[10].playerId).toBe('wing');
    expect(assigned(slots)).toEqual(['wing']);
  });

  it('prvo rezerviše poznate pozicije i svakog igrača koristi najviše jednom', () => {
    const slots = buildFormationSlots([
      { playerId: 'unknown', positionX: null, positionY: null },
      { playerId: 'wing', positionX: 75, positionY: 28 },
      { playerId: 'wing', positionX: 50, positionY: 90 },
    ]);
    expect(slots[10].playerId).toBe('wing');
    expect(assigned(slots).sort()).toEqual(['unknown', 'wing']);
  });

  it('klupski slot 10 ostaje slot 10 i kad su ranija mjesta prazna', () => {
    const squad = [squadSlot(0, null, { lineRole: 'GK' }), squadSlot(10, 'wing'), squadSlot(11, 'bench', { isBench: true })];
    const slots = buildClubMatchLineup(undefined, 'home', squad, false);
    expect(slots[0].playerId).toBe('');
    expect(slots[10].playerId).toBe('wing');
    expect(assigned(slots)).toEqual(['wing']);
    expect(squadToLineupInputs(squad)).toEqual([{ playerId: 'wing', positionX: 75, positionY: 28 }]);
  });


  it('4-4-2 čuva stvarnu geometriju, prazna mjesta i pozicijske linije', () => {
    const squad = Array.from({ length: 11 }, (_, index) => {
      const role = index === 0 ? 'GK' : index < 5 ? 'DEF' : index < 9 ? 'MID' : 'FWD';
      const x = index === 0 ? 14 : index < 5 ? 38 : index < 9 ? 62 : 86;
      const y = index === 0 ? 50 : index < 5 ? [12, 37, 63, 88][index - 1] :
        index < 9 ? [12, 37, 63, 88][index - 5] : [37, 63][index - 9];
      return squadSlot(index, index === 8 ? 'midfielder' : index === 10 ? 'forward' : null,
        { lineRole: role, positionX: x, positionY: y });
    });
    const slots = buildClubMatchLineup(undefined, 'home', squad, false);
    expect(slots[0].playerId).toBe('');
    expect(slots[8]).toMatchObject({ label: 'MID', playerId: 'midfielder', positionX: 88, positionY: 38 });
    expect(slots[10]).toMatchObject({ label: 'FWD', playerId: 'forward', positionX: 63, positionY: 14 });
    expect(squadToLineupInputs(squad)).toEqual([
      { playerId: 'midfielder', positionX: 88, positionY: 38 },
      { playerId: 'forward', positionX: 63, positionY: 14 },
    ]);
    const defaults = [
      row('midfielder', 88, 38, { id: 'squad-default-home-8' }),
      row('forward', 63, 14, { id: 'squad-default-home-10' }),
    ];
    const pitch = matchLineupToPitchSlots(defaults, 'home', squad);
    expect(pitch).toEqual([
      expect.objectContaining({ playerId: 'midfielder', positionX: 62, positionY: 88 }),
      expect.objectContaining({ playerId: 'forward', positionX: 86, positionY: 63 }),
    ]);
  });

  it('nepotpun ili nevaljan klupski raspored vraća upozorivu rezervnu mrežu bez gubitka igrača', () => {
    const squad = [squadSlot(0, null, { lineRole: 'GK' }), squadSlot(10, 'wing')];
    expect(buildSquadFormationLayout(squad)).toBeUndefined();
    expect(buildClubMatchLineup(undefined, 'home', squad, false)[10]).toMatchObject({ playerId: 'wing', positionX: 75, positionY: 28 });
    const invalid = Array.from({ length: 11 }, (_, index) => squadSlot(index, null));
    expect(buildSquadFormationLayout(invalid)).toBeUndefined();
  });

  it('spremljena postava ima prednost bez dopunjavanja iz trenutne klupske postave', () => {
    const lineup = [row('former-starter', 75, 28)];
    const squad = [squadSlot(0, 'current-keeper', { lineRole: 'GK' }), squadSlot(10, 'current-wing')];
    const slots = buildClubMatchLineup(lineup, 'home', squad, true);
    expect(slots[0].playerId).toBe('');
    expect(slots[10].playerId).toBe('former-starter');
    expect(assigned(slots)).toEqual(['former-starter']);
  });

  it('namjerno prazna postava i prazna druga strana ostaju prazne', () => {
    const squad = [squadSlot(0, 'current-keeper', { lineRole: 'GK' })];
    expect(assigned(buildClubMatchLineup([], 'home', squad, true))).toEqual([]);
    expect(assigned(buildClubMatchLineup([row('away', 75, 28, { clubId: 'away' })], 'home', squad, true))).toEqual([]);
  });

  it('spremljeni redovi i bez novog flaga imaju prednost radi kompatibilnosti', () => {
    const slots = buildClubMatchLineup([row('saved', 75, 28)], 'home', [squadSlot(0, 'current')]);
    expect(assigned(slots)).toEqual(['saved']);
    expect(slots[10].playerId).toBe('saved');
  });

  it('javni lokalni fallback je dozvoljen samo prije spremanja i ne duplicira igrače', () => {
    const teams = [
      { clubId: 'home', squad: [squadSlot(10, 'wing')] },
      { clubId: 'away', squad: [squadSlot(10, 'wing', { clubId: 'away' })] },
    ];
    expect(resolvePublicMatchLineup([], true, teams)).toEqual([]);
    const fallback = resolvePublicMatchLineup([], false, teams);
    expect(fallback).toHaveLength(1);
    expect(fallback[0]).toMatchObject({ id: 'squad-default-home-10', playerId: 'wing' });
    const saved = [row('saved', 75, 28)];
    expect(resolvePublicMatchLineup(saved, false, teams)).toEqual(saved);
  });

  it('legacy red bez koordinata koristi poznati slot igrača ili pozicijsku grupu', () => {
    const slots = buildClubMatchLineup([row('attacker', null, null)], 'home', [], true);
    expect(slots[0].playerId).toBe('');
    expect(slots.slice(8).some((s) => s.playerId === 'attacker')).toBe(true);
  });

  it('javna postava prikazuje sačuvanog startera i bez klupskog slota, u koordinatama utakmice', () => {
    const pitch = matchLineupToPitchSlots([row('former-starter', 75, 28)], 'home', []);
    expect(pitch).toHaveLength(1);
    expect(pitch[0].playerId).toBe('former-starter');
    expect(mapPitchPosition(pitch[0].positionX, pitch[0].positionY, false)).toEqual({ left: 75, top: 28 });
  });

  it('nepotpun klupski predložak koristi rezervne koordinate, bez klupe ili drugog kluba', () => {
    const wing = squadSlot(10, 'wing');
    const lineup = [
      row('wing', 75, 28, { id: 'squad-default-home-10' }),
      row('bench', 50, 22, { isStarter: false }),
      row('away', 75, 28, { clubId: 'away' }),
    ];
    const pitch = matchLineupToPitchSlots(lineup, 'home', [wing]);
    expect(pitch).toHaveLength(1);
    expect(pitch[0]).toMatchObject({ playerId: 'wing', positionX: 72, positionY: 75 });
  });

  it('različiti igrači na istoj legacy koordinati ne nestaju i ne dupliciraju se', () => {
    const slots = buildClubMatchLineup([row('one', 75, 28), row('two', 75, 28)], 'home', [], true);
    expect(assigned(slots).sort()).toEqual(['one', 'two']);
    expect(slots).toHaveLength(FORMATION_SLOTS.length);
  });
});

describe('koordinate i nedirnuti redovi pri spremanju', () => {
  it('javna postava čuva i stvarne koordinate izvan fiksne mreže', () => {
    const pitch = matchLineupToPitchSlots([row('wing', 71, 25)], 'home');
    expect(mapPitchPosition(pitch[0].positionX, pitch[0].positionY, false)).toEqual({ left: 71, top: 25 });
  });

  it('fallback preskače klub koji već ima redove i ne duplicira igrača', () => {
    const existing = [{ id: 'squad-default-home-0', playerId: 'p1', clubId: 'home' }] as MatchLineup[];
    const result = resolvePublicMatchLineup(existing, false, [
      { clubId: 'home', squad: [squadSlot(0, 'p2')] },
      { clubId: 'away', squad: [squadSlot(0, 'p1', { clubId: 'away' })] },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe('p1');

    const shared = resolvePublicMatchLineup([], false, [
      { clubId: 'home', squad: [squadSlot(10, 'wing')] },
      { clubId: 'away', squad: [squadSlot(10, 'wing', { clubId: 'away' })] },
    ]);
    expect(shared).toHaveLength(1);
    expect(shared[0].clubId).toBe('home');
  });
});
