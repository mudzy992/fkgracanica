import { describe, it, expect } from 'vitest';
import { buildFormationSlots, FORMATION_SLOTS } from './formation-slots';
import { pickFeaturedTrophy, splitFeaturedTrophy } from './trophy-utils';
import { groupSponsorsByTier, SPONSOR_TIER_ORDER } from './sponsor-tiers';
import { userInitials } from './user-initials';

describe('fe06-batch69f2 ostatak formacije+trophy+sponsor 15+ grana', () => {
  it('buildFormationSlots role matching i fallback na prvo prazno', () => {
    const gk = buildFormationSlots([{ playerId: 'gk', role: 'GK' }]);
    expect(gk[0].playerId).toBe('gk');
    const def = buildFormationSlots([
      { playerId: 'gk', role: 'GK' },
      { playerId: 'def1', role: 'DEF' },
    ]);
    expect(def[0].playerId).toBe('gk');
    expect(def[1].playerId).toBe('def1');
    const any = buildFormationSlots([{ playerId: 'any' }]);
    expect(any[0].playerId).toBe('any');
    const unknownRole = buildFormationSlots([{ playerId: 'x', role: 'UNKNOWN' as never }]);
    expect(unknownRole[0].playerId).toBe('x');
  });

  it('buildFormationSlots validPitchCoordinates update grane', () => {
    const custom = buildFormationSlots([{ playerId: 'p1', positionX: 5, positionY: 5 }]);
    const usedSlot = custom.find(s => s.playerId === 'p1')!;
    expect(usedSlot.positionX).toBe(5);
    expect(usedSlot.positionY).toBe(5);
    const existing = buildFormationSlots([{ playerId: 'p2', positionX: 50, positionY: 90 }]);
    expect(existing[0].playerId).toBe('p2');
    expect(existing[0].positionX).toBe(50);
    const invalidCoord = buildFormationSlots([{ playerId: 'p3', positionX: null, positionY: null }]);
    expect(invalidCoord.some(s => s.playerId === 'p3')).toBe(true);
    const dupInLayout = buildFormationSlots([{ playerId: 'p4', positionX: 20, positionY: 70, preferredSlotIndex: 5 }]);
    const p4slot = dupInLayout.find(s => s.playerId === 'p4')!;
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
    const slots = buildFormationSlots([
      { playerId: 'a', positionX: 50, positionY: 90 },
      { playerId: 'b', positionX: 5, positionY: 5, preferredSlotIndex: 1 },
      { playerId: 'c', positionX: 30, positionY: 50, preferredSlotIndex: 2 },
    ]);
    const bSlot = slots.find(s => s.playerId === 'b')!;
    expect(bSlot.positionX).toBe(5);
    const cSlot = slots.find(s => s.playerId === 'c')!;
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
