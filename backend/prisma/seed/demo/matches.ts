import { MatchStatus } from '@prisma/client';
import type { SeedPrisma } from '../prisma-client';
import type { DemoCompetitionContext } from './clubs-competition';

function roundName(number: number) {
  return `${number}. kolo`;
}

function lastWeekend(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 2 : day === 6 ? 1 : day + 1;
  d.setDate(d.getDate() - diff);
  d.setHours(15, 0, 0, 0);
  return d;
}

function nextWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(16, 0, 0, 0);
  return d;
}

async function ensureRound(prisma: SeedPrisma, seasonId: string, number: number) {
  return prisma.round.upsert({
    where: { seasonId_number: { seasonId, number } },
    create: { seasonId, number, name: roundName(number) },
    update: {},
  });
}

async function createMatchIfMissing(
  prisma: SeedPrisma,
  ctx: DemoCompetitionContext,
  data: {
    round: number;
    scheduledAt: Date;
    status: MatchStatus;
    homeScore?: number;
    awayScore?: number;
    venue?: string;
  },
) {
  const round = await ensureRound(prisma, ctx.seasonId, data.round);
  const existing = await prisma.match.findFirst({
    where: {
      seasonId: ctx.seasonId,
      homeClubId: ctx.ownClubId,
      awayClubId: ctx.opponentClubId,
      round: data.round,
    },
  });
  if (existing) {
    if (!existing.roundId) {
      await prisma.match.update({ where: { id: existing.id }, data: { roundId: round.id } });
    }
    return;
  }

  await prisma.match.create({
    data: {
      seasonId: ctx.seasonId,
      homeClubId: ctx.ownClubId,
      awayClubId: ctx.opponentClubId,
      round: data.round,
      roundId: round.id,
      scheduledAt: data.scheduledAt,
      status: data.status,
      homeScore: data.homeScore ?? 0,
      awayScore: data.awayScore ?? 0,
      venue: data.venue,
    },
  });
}

export async function seedMatches(prisma: SeedPrisma, ctx: DemoCompetitionContext) {
  await createMatchIfMissing(prisma, ctx, {
    round: 12,
    scheduledAt: lastWeekend(),
    status: MatchStatus.FINISHED,
    homeScore: 2,
    awayScore: 1,
    venue: 'Stadion FK Gračanica',
  });

  await createMatchIfMissing(prisma, ctx, {
    round: 13,
    scheduledAt: nextWeek(),
    status: MatchStatus.SCHEDULED,
    venue: 'Stadion FK Gračanica',
  });
}
