import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import type { StandingParticipant } from '../statistics/standings.util';

type Tx = Prisma.TransactionClient;

export async function getSeasonParticipantClubs(
  prisma: PrismaService | Tx,
  seasonId: string,
): Promise<StandingParticipant[]> {
  const rows = await prisma.seasonClub.findMany({
    where: { seasonCompetitionId: seasonId },
    include: {
      club: { select: { id: true, name: true, slug: true, crestPath: true } },
    },
    orderBy: { club: { name: 'asc' } },
  });
  return rows.map((r) => ({
    id: r.club.id,
    name: r.club.name,
    slug: r.club.slug,
    crestPath: r.club.crestPath,
  }));
}

export async function syncSeasonParticipants(
  tx: Tx,
  seasonId: string,
  clubIds: string[],
) {
  const unique = [...new Set(clubIds)];
  await tx.seasonClub.deleteMany({ where: { seasonCompetitionId: seasonId } });
  if (!unique.length) return;
  await tx.seasonClub.createMany({
    data: unique.map((clubId) => ({ seasonCompetitionId: seasonId, clubId })),
  });
}
