import { MatchReportStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { rebuildSeasonPlayerStatistics } from '../statistics/season-stats-rebuild.service';

export type RoundDeleteImpact = {
  matchCount: number;
  approvedReportCount: number;
  ticketCount: number;
  eventCount: number;
  lineupCount: number;
  commentCount: number;
};

export async function getRoundDeleteImpact(
  prisma: PrismaService,
  roundId: string,
): Promise<RoundDeleteImpact> {
  const matches = await prisma.match.findMany({
    where: { roundId },
    select: {
      id: true,
      reportStatus: true,
      _count: {
        select: {
          events: true,
          lineup: true,
          liveComments: true,
          tickets: true,
        },
      },
    },
  });
  return {
    matchCount: matches.length,
    approvedReportCount: matches.filter(
      (m) => m.reportStatus === MatchReportStatus.APPROVED,
    ).length,
    ticketCount: matches.reduce((s, m) => s + m._count.tickets, 0),
    eventCount: matches.reduce((s, m) => s + m._count.events, 0),
    lineupCount: matches.reduce((s, m) => s + m._count.lineup, 0),
    commentCount: matches.reduce((s, m) => s + m._count.liveComments, 0),
  };
}

export async function cascadeDeleteRound(
  prisma: PrismaService,
  roundId: string,
  seasonId: string,
) {
  const matches = await prisma.match.findMany({
    where: { roundId },
    select: { reportStatus: true },
  });
  const needsRebuild = matches.some(
    (m) => m.reportStatus === MatchReportStatus.APPROVED,
  );

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { roundId } });
    await tx.round.delete({ where: { id: roundId } });
    if (needsRebuild) {
      await rebuildSeasonPlayerStatistics(tx, seasonId);
    }
  });

  return { deletedMatches: matches.length, statsRebuilt: needsRebuild };
}
