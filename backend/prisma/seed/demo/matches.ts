import { MatchStatus } from '@prisma/client';
import type { SeedPrisma } from '../prisma-client';
import type { DemoCompetitionContext } from './clubs-competition';

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
  const existing = await prisma.match.findFirst({
    where: {
      seasonId: ctx.seasonId,
      homeClubId: ctx.ownClubId,
      awayClubId: ctx.opponentClubId,
      round: data.round,
    },
  });
  if (existing) return;

  await prisma.match.create({
    data: {
      seasonId: ctx.seasonId,
      homeClubId: ctx.ownClubId,
      awayClubId: ctx.opponentClubId,
      round: data.round,
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
