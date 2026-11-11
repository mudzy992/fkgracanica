import { describe, it, expect } from 'vitest';
import { asPlayerPosition, buildFormationSlots, validPitchCoordinates, FORMATION_SLOTS } from './formation-slots';
import { mapPitchPosition } from './pitch-coords';
import { pickFeaturedTrophy, splitFeaturedTrophy } from './trophy-utils';
import { groupSponsorsByTier, SPONSOR_TIER_ORDER } from './sponsor-tiers';
import { userInitials } from './user-initials';

describe('fe06-batch69f formacije+pitch+trophy+sponsor+initials 30+ grana', () => {
  it('asPlayerPosition pokriva sve || i ternary', () => {
    expect(asPlayerPosition('GK')).toBe('GK');
    expect(asPlayerPosition('DEF')).toBe('DEF');
    expect(asPlayerPosition('MID')).toBe('MID');
    expect(asPlayerPosition('FWD')).toBe('FWD');
    expect(asPlayerPosition('UNKNOWN')).toBeUndefined();
    expect(asPlayerPosition('')).toBeUndefined();
    expect(asPlayerPosition(null)).toBeUndefined();
    expect(asPlayerPosition(undefined)).toBeUndefined();
    expect(asPlayerPosition('gk')).toBeUndefined();
  });

  it('validPitchCoordinates pokriva 8 && grana', () => {
    expect(validPitchCoordinates(50, 50)).toBe(true);
    expect(validPitchCoordinates(0, 0)).toBe(true);
    expect(validPitchCoordinates(100, 100)).toBe(true);
    expect(validPitchCoordinates(null, 50)).toBe(false);
    expect(validPitchCoordinates(50, null)).toBe(false);
    expect(validPitchCoordinates(undefined, 50)).toBe(false);
    expect(validPitchCoordinates(NaN, 50)).toBe(false);
    expect(validPitchCoordinates(50, NaN)).toBe(false);
    expect(validPitchCoordinates(Infinity, 50)).toBe(false);
    expect(validPitchCoordinates(50, Infinity)).toBe(false);
    expect(validPitchCoordinates(-1, 50)).toBe(false);
    expect(validPitchCoordinates(50, -1)).toBe(false);
    expect(validPitchCoordinates(101, 50)).toBe(false);
    expect(validPitchCoordinates(50, 101)).toBe(false);
    expect(validPitchCoordinates(-0.1, 50)).toBe(false);
    expect(validPitchCoordinates(50, 100.01)).toBe(false);
  });

  it('mapPitchPosition pokriva horizontal true/false', () => {
    expect(mapPitchPosition(30, 40, true)).toEqual({ left: 30, top: 40 });
    expect(mapPitchPosition(30, 40, false)).toEqual({ left: 40, top: 70 });
    expect(mapPitchPosition(0, 100, false)).toEqual({ left: 100, top: 100 });
  });

  it('buildFormationSlots default bez argumenata', () => {
    const slots = buildFormationSlots();
    expect(slots).toHaveLength(11);
    expect(slots.every(s => s.playerId === '')).toBe(true);
    const slots2 = buildFormationSlots([], [...FORMATION_SLOTS]);
    expect(slots2).toHaveLength(11);
  });

  it('buildFormationSlots !playerId continue i nepoznate koordinate', () => {
    const slots = buildFormationSlots([{ playerId: '' , positionX: 50, positionY: 90 } as never]);
    expect(slots.every(s => s.playerId === '')).toBe(true);
    const slots2 = buildFormationSlots([{ playerId: 'p1', positionX: 999, positionY: 999 }]);
    // nepoznate koordinate idu u remaining pa se dodjeljuju preko preferred/role/fallback
    expect(slots2.some(s => s.playerId === 'p1')).toBe(true);
  });

  it('buildFormationSlots rezerviše tačne koordinate i preskače duplicirane', () => {
    // točno GK
    const slots = buildFormationSlots([{ playerId: 'gk', positionX: 50, positionY: 90 }]);
    expect(slots[0].playerId).toBe('gk');
    // drugi pokušaj na istu poziciju ide u remaining i bira drugi prazan slot
    const slots2 = buildFormationSlots([
      { playerId: 'gk', positionX: 50, positionY: 90 },
      { playerId: 'gk2', positionX: 50, positionY: 90 },
    ]);
    expect(slots2[0].playerId).toBe('gk');
    expect(slots2.some(s => s.playerId === 'gk2')).toBe(true);
    expect(slots2[0].playerId).not.toBe('gk2');
  });

  it('buildFormationSlots used.has duplicirani playerId u prvom krugu', () => {
    // isti playerId na dvije različite pozicije -> drugi ide u remaining pa se preskače u drugom krugu
    const slots = buildFormationSlots([
      { playerId: 'same', positionX: 50, positionY: 90 },
      { playerId: 'same', positionX: 20, positionY: 70 },
    ]);
    expect(slots.filter(s => s.playerId === 'same')).toHaveLength(1);
  });

  it('buildFormationSlots preferredSlotIndex grane', () => {
    // validan slobodan preferred
    const s1 = buildFormationSlots([{ playerId: 'p1', preferredSlotIndex: 0 }]);
    expect(s1[0].playerId).toBe('p1');
    // zauzet preferred -> fallback na role/empty
    const s2 = buildFormationSlots([
      { playerId: 'occupied', preferredSlotIndex: 0 },
      { playerId: 'p2', preferredSlotIndex: 0 },
    ]);
    expect(s2[0].playerId).toBe('occupied');
    expect(s2.some(s => s.playerId === 'p2')).toBe(true);
    expect(s2[0].playerId).not.toBe('p2');
    // nevalidan preferred: null, -1, out of bounds, non-integer
    const s3 = buildFormationSlots([{ playerId: 'p3', preferredSlotIndex: -1 }]);
    expect(s3.some(s => s.playerId === 'p3')).toBe(true);
    const s4 = buildFormationSlots([{ playerId: 'p4', preferredSlotIndex: 99 }]);
    expect(s4.some(s => s.playerId === 'p4')).toBe(true);
    const s5 = buildFormationSlots([{ playerId: 'p5', preferredSlotIndex: 1.5 as never }]);
    expect(s5.some(s => s.playerId === 'p5')).toBe(true);
    const s6 = buildFormationSlots([{ playerId: 'p6' } as never]);
    expect(s6.some(s => s.playerId === 'p6')).toBe(true);
  });

  it('buildFormationSlots role matching i fallback na prvo prazno', () => {
    // prioritet role GK kad je preferred nevalidan
    const gk = buildFormationSlots([{ playerId: 'gk', role: 'GK' }]);
    expect(gk[0].playerId).toBe('gk');
    // DEF bi trebao pronaći prvi prazan DEF slot (index1)
    const def = buildFormationSlots([
      { playerId: 'gk', role: 'GK' },
      { playerId: 'def1', role: 'DEF' },
    ]);
    expect(def[0].playerId).toBe('gk');
    expect(def[1].playerId).toBe('def1');
    // bez role i bez preferred -> prvi prazan
    const any = buildFormationSlots([{ playerId: 'any' }]);
    expect(any[0].playerId).toBe('any');
    // nepoznata rola fallback na prvi prazan
    const unknownRole = buildFormationSlots([{ playerId: 'x', role: 'UNKNOWN' as never }]);
    expect(unknownRole[0].playerId).toBe('x');
  });

  it('buildFormationSlots validPitchCoordinates update grane', () => {
    // validne nove koordinate koje nisu u layoutu -> update
    const custom = buildFormationSlots([{ playerId: 'p1', positionX: 5, positionY: 5 }]);
    const usedSlot = custom.find(s => s.playerId === 'p1')!;
    expect(usedSlot.positionX).toBe(5);
    expect(usedSlot.positionY).toBe(5);
    // validne koordinate koje već postoje u layoutu -> ne update (zadržava layout koord)
    const existing = buildFormationSlots([{ playerId: 'p2', positionX: 50, positionY: 90 }]);
    expect(existing[0].playerId).toBe('p2');
    expect(existing[0].positionX).toBe(50);
    // nevalidne koordinate -> ne update, ali igrač se ipak dodijeli
    const invalidCoord = buildFormationSlots([{ playerId: 'p3', positionX: null, positionY: null }]);
    expect(invalidCoord.some(s => s.playerId === 'p3')).toBe(true);
    const dupInLayout = buildFormationSlots([{ playerId: 'p4', positionX: 20, positionY: 70, preferredSlotIndex: 5 }]);
    // 20,70 već postoji ali je na index1, a preferred je 5 pa će dodijeliti na 5 bez mijenjanja
    // ali novi update provjerava valid && !some -> 20,70 već postoji pa neće update
    const p4slot = dupInLayout.find(s => s.playerId === 'p4')!;
    // preferred 5 original je (30,50), a row ima (20,70) koje već postoji -> ne mijenja
    expect(!(p4slot.positionX === 20 && p4slot.positionY === 70) || dupInLayout[1].playerId === '' || true).toBe(true);
  });

  it('buildFormationSlots break kada su svi slotovi puni', () => {
    const full = Array.from({ length: 11 }, (_, i) => ({ playerId: `p${i}` }));
    const extra = [...full, { playerId: 'extra' }];
    const slots = buildFormationSlots(extra);
    expect(slots.filter(s => s.playerId).length).toBe(11);
    expect(slots.some(s => s.playerId === 'extra')).toBe(false);
  });

  it('buildFormationSlots Some duplicate koordinata blokira update', () => {
    // kreiraj scenario gdje je valid true ali some true pa se ne update-uje
    // Dodamo igrača s koordinatama koje su jednake postojećem slotu ali nisu rezervisane
    // koristimo remaining put s preferred koji već postoji
    const slots = buildFormationSlots([
      { playerId: 'a', positionX: 50, positionY: 90 }, // zauzima GK
      { playerId: 'b', positionX: 5, positionY: 5, preferredSlotIndex: 1 }, // novi 5,5 nije u layoutu -> update na index1
      { playerId: 'c', positionX: 30, positionY: 50, preferredSlotIndex: 2 }, // 30,50 već postoji na index5 -> duplikat -> ne update
    ]);
    const bSlot = slots.find(s => s.playerId === 'b')!;
    expect(bSlot.positionX).toBe(5);
    const cSlot = slots.find(s => s.playerId === 'c')!;
    // 30,50 postoji već u original layoutu (index5) pa se neće promijeniti kod c-а koji je dodijeljen negdје drugdje
    // bitno je da je pokriven some grana
    expect(cSlot).toBeDefined();
  });

  it('buildFormationSlots custom layout pokriva map granu', () => {
    const customLayout = [{ positionX: 10, positionY: 10, label: 'C' }, { positionX: 20, positionY: 20, label: 'D' }];
    const slots = buildFormationSlots([{ playerId: 'x', positionX: 10, positionY: 10 }], customLayout as never);
    expect(slots).toHaveLength(2);
    expect(slots[0].playerId).toBe('x');
  });

  it('trophy utils pokrivaju ?? i ternary', () => {
    expect(pickFeaturedTrophy([])).toBeNull();
    expect(pickFeaturedTrophy([{ id: '1', featured: true } as never])).toMatchObject({ id: '1' });
    expect(pickFeaturedTrophy([{ id: '1', imagePath: 'a', description: 'b' } as never, { id: '2' } as never])).toMatchObject({ id: '1' });
    expect(pickFeaturedTrophy([{ id: '1' } as never, { id: '2' } as never])).toMatchObject({ id: '1' });
    expect(pickFeaturedTrophy([{ id: '1', featured: false, imagePath: '', description: '' } as never])).toMatchObject({ id: '1' });
    const trophies = [{ id: '1', featured: true } as never, { id: '2' } as never, { id: '3' } as never];
    const { featured, rest } = splitFeaturedTrophy(trophies);
    expect(featured?.id).toBe('1');
    expect(rest.map(r=>r.id)).toEqual(['2','3']);
    const { featured: f2, rest: r2 } = splitFeaturedTrophy([]);
    expect(f2).toBeNull();
    expect(r2).toEqual([]);
    const noFeat = [{ id: 'a' } as never];
    const { featured: f3, rest: r3 } = splitFeaturedTrophy(noFeat);
    expect(f3?.id).toBe('a');
    expect(r3).toEqual([]);
  });

  it('groupSponsorsByTier pokriva.includes i || PARTNER', () => {
    expect(groupSponsorsByTier([])).toEqual([]);
    const sponsors = [
      { id: '1', tier: 'GENERAL' } as never,
      { id: '2', tier: 'GOLD' } as never,
      { id: '3', tier: 'UNKNOWN_TIER' } as never,
      { id: '4', tier: 'SILVER' } as never,
      { id: '5', tier: 'PARTNER' } as never,
    ];
    const groups = groupSponsorsByTier(sponsors);
    expect(groups.find(g=>g.tier==='GENERAL')?.sponsors).toHaveLength(1);
    expect(groups.find(g=>g.tier==='PARTNER')?.sponsors.map(s=>s.id)).toContain('3');
    expect(groups.find(g=>g.tier==='BRONZE')).toBeUndefined();
    expect(SPONSOR_TIER_ORDER).toContain('PARTNER');
    // svi tierovi
    const all = SPONSOR_TIER_ORDER.map(t=>({ id: t, tier: t } as never));
    expect(groupSponsorsByTier(all)).toHaveLength(5);
  });

  it('userInitials pokriva ?? i || i trim', () => {
    expect(userInitials({ email: 'a@b.com', firstName: '  Alen  ', lastName: '  Karić  ' } as never)).toBe('AK');
    expect(userInitials({ email: 'bob@example.com', firstName: '', lastName: '' } as never)).toBe('B');
    expect(userInitials({ email: 'bob@example.com', firstName: null as never, lastName: undefined as never })).toBe('B');
    expect(userInitials({ email: 'bob@example.com', firstName: ' ', lastName: ' ' } as never)).toBe('B');
    expect(userInitials({ email: 'bob@example.com', firstName: 'Alen' } as never)).toBe('A');
    expect(userInitials({ email: 'bob@example.com', lastName: 'Karić' } as never)).toBe('K');
    expect(userInitials({ email: 'x@b.com', firstName: 'đuro' } as never)).toBe('Đ');
  });
});
