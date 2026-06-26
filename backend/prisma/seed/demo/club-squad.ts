import type { SeedPrisma } from '../prisma-client';
import { buildFormationSlots, DEFAULT_BENCH_SIZE } from '../../../src/clubs/formation-layout.util';

export async function seedClubStadiumAndSquad(prisma: SeedPrisma, ownClubId: string) {
  const club = await prisma.club.findUnique({ where: { id: ownClubId } });
  if (!club) return;

  const existingStadium = await prisma.stadium.findUnique({ where: { clubId: ownClubId } });
  if (!existingStadium && club.stadium) {
    await prisma.stadium.create({
      data: {
        clubId: ownClubId,
        name: club.stadium,
        city: club.city ?? undefined,
        description: 'Domaći stadion FK Gračanica.',
      },
    });
  }

  const slotCount = await prisma.clubSquadSlot.count({ where: { clubId: ownClubId } });
  if (slotCount > 0) return;

  const layouts = buildFormationSlots({
    def: club.formationDef,
    mid: club.formationMid,
    fwd: club.formationFwd,
  });
  await prisma.clubSquadSlot.createMany({
    data: layouts.map((l) => ({ clubId: ownClubId, ...l })),
  });
  await prisma.clubSquadSlot.createMany({
    data: Array.from({ length: DEFAULT_BENCH_SIZE }, (_, i) => ({
      clubId: ownClubId,
      slotIndex: i,
      lineRole: 'MID' as const,
      isBench: true,
      benchOrder: i,
    })),
  });

  const players = await prisma.player.findMany({
    where: { clubId: ownClubId, isActive: true },
    orderBy: [{ position: 'asc' }, { number: 'asc' }],
  });
  const starters = await prisma.clubSquadSlot.findMany({
    where: { clubId: ownClubId, isBench: false },
    orderBy: { slotIndex: 'asc' },
  });
  const used = new Set<string>();
  for (const slot of starters) {
    const player = players.find((p) => p.position === slot.lineRole && !used.has(p.id));
    if (!player) continue;
    used.add(player.id);
    await prisma.clubSquadSlot.update({ where: { id: slot.id }, data: { playerId: player.id } });
  }
}
