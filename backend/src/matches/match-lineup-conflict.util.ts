import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

/** Serializuje promjenu klubova i zamjenu postave za istu utakmicu. */
export async function lockMatchForLineup(
  tx: Prisma.TransactionClient,
  matchId: string,
) {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Match" WHERE "id" = ${matchId} FOR UPDATE
  `;
  if (!rows.length) throw new NotFoundException('Utakmica nije pronađena');
  return tx.match.findUniqueOrThrow({ where: { id: matchId } });
}

/** Bez brisanja: nijedan spremljeni red ne smije ostati van izabranih klubova. */
export async function assertLineupMatchesClubs(
  tx: Prisma.TransactionClient,
  matchId: string,
  clubIds: [string, string],
) {
  const conflict = await tx.matchLineup.findFirst({
    where: { matchId, clubId: { notIn: clubIds } },
    select: { id: true },
  });
  if (conflict) {
    throw new ConflictException(
      'Spremljena postava sadrži redove prethodnog kluba. Vratite odgovarajuće klubove ili prvo uskladite postavu.',
    );
  }
}
