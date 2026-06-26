import { Prisma } from '@prisma/client';

export async function deactivateOtherSeasons(
  tx: Prisma.TransactionClient,
  competitionId: string,
  exceptId?: string,
) {
  await tx.season.updateMany({
    where: { competitionId, isActive: true, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    data: { isActive: false },
  });
}
