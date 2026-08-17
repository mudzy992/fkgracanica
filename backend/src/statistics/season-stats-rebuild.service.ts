import { MatchReportStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import {
  aggregatePlayerStatsFromMatch,
  mergePlayerSeasonAggs,
} from './season-stats-rebuild.util';

type TxClient = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

export async function rebuildSeasonPlayerStatistics(
  prisma: PrismaService | TxClient,
  seasonId: string,
) {
  const matches = await prisma.match.findMany({
    where: { seasonCompetitionId: seasonId, reportStatus: MatchReportStatus.APPROVED },
    include: { events: true },
  });

  const seasonAgg = new Map<string, ReturnType<typeof aggregatePlayerStatsFromMatch> extends Map<
    string,
    infer V
  >
    ? V
    : never>();
  for (const match of matches) {
    mergePlayerSeasonAggs(seasonAgg, aggregatePlayerStatsFromMatch(match.events));
  }

  await prisma.playerStatistics.deleteMany({ where: { seasonCompetitionId: seasonId } });
  const rows = [...seasonAgg.values()].filter((r) => r.appearances > 0);
  if (rows.length) {
    await prisma.playerStatistics.createMany({
      data: rows.map((r) => ({ seasonCompetitionId: seasonId, ...r })),
    });
  }
  return { playersUpdated: rows.length, matchesProcessed: matches.length };
}
