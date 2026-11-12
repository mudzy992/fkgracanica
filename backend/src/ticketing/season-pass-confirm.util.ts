import type { PrismaService } from '../prisma/prisma.service';

export async function confirmSeasonPassFlow(
  prisma: PrismaService,
  passId: string,
  extras?: { paymentProvider?: string; externalId?: string },
): Promise<boolean> {
  const pass = await prisma.seasonPass.findUnique({ where: { id: passId } });
  if (!pass || pass.status === 'ACTIVE') return false;
  if (pass.status !== 'PENDING' && pass.status !== 'CANCELLED') return false;
  await prisma.seasonPass.update({
    where: { id: passId },
    data: {
      status: 'ACTIVE',
      ...(extras?.paymentProvider
        ? { paymentProvider: extras.paymentProvider }
        : {}),
      ...(extras?.externalId ? { externalId: extras.externalId } : {}),
    },
  });
  return true;
}
