import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

export type LineupSlotInput = {
  playerId: string;
  clubId: string;
  positionX?: number;
  positionY?: number;
  isStarter?: boolean;
};

export async function validateMatchLineup(
  prisma: PrismaService,
  matchId: string,
  slots: LineupSlotInput[],
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { homeClubId: true, awayClubId: true },
  });
  if (!match) throw new BadRequestException('Utakmica nije pronađena.');

  const allowed = new Set([match.homeClubId, match.awayClubId]);
  const playerIds = new Set<string>();

  for (const slot of slots) {
    if (!allowed.has(slot.clubId)) {
      throw new BadRequestException(
        'Igrač mora pripadati domaćem ili gostujućem klubu.',
      );
    }
    if (playerIds.has(slot.playerId)) {
      throw new BadRequestException('Igrač ne može biti duplo u postavi.');
    }
    playerIds.add(slot.playerId);

    const player = await prisma.player.findFirst({
      where: { id: slot.playerId, clubId: slot.clubId },
    });
    if (!player)
      throw new BadRequestException('Igrač ne pripada odabranom klubu.');
  }
}
