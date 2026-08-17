import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

type Tx = Prisma.TransactionClient;
type Db = PrismaService | Tx;

export type SeasonPickInput = {
  id: string;
  isActive: boolean;
  yearStart: number;
  isLeague?: boolean;
};

export function pickDefaultSeason<T extends SeasonPickInput>(
  seasons: T[],
  opts?: { leagueOnly?: boolean },
): T | undefined {
  const pool = opts?.leagueOnly ? seasons.filter((s) => s.isLeague) : seasons;
  const active = pool.filter((s) => s.isActive);
  const ranked = (active.length ? active : pool)
    .slice()
    .sort((a, b) => b.yearStart - a.yearStart);
  return ranked[0];
}

export async function ensureSingleLeagueCompetition(tx: Tx, exceptId?: string) {
  await tx.competition.updateMany({
    where: { isLeague: true, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    data: { isLeague: false },
  });
}

export async function findDefaultLeagueSeason(prisma: Db) {
  const seasons = await prisma.season.findMany({
    where: { competition: { isLeague: true } },
    orderBy: { yearStart: 'desc' },
  });
  return seasons.find((s) => s.isActive) ?? seasons[0] ?? null;
}
