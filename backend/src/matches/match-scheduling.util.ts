import { BadRequestException } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

export async function assertSingleScheduledHomeMatch(
  prisma: Pick<PrismaService, 'club' | 'match'>,
  homeClubId: string,
  excludeMatchId?: string,
) {
  const homeClub = await prisma.club.findUnique({
    where: { id: homeClubId },
    select: { isOwnClub: true },
  });
  if (!homeClub?.isOwnClub) return;

  const existing = await prisma.match.findFirst({
    where: {
      status: MatchStatus.SCHEDULED,
      homeClub: { isOwnClub: true },
      ...(excludeMatchId ? { id: { not: excludeMatchId } } : {}),
    },
    select: { id: true },
  });
  if (existing) {
    throw new BadRequestException(
      'Već postoji zakazana domaća utakmica. Promijenite status postojeće prije nove.',
    );
  }
}
