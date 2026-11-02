import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

export async function validateMembershipCard(
  prisma: PrismaService,
  qrCode: string,
) {
  const card = await prisma.membershipCard.findUnique({
    where: { qrCode },
    include: {
      membership: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  });
  if (!card) throw new NotFoundException('Ulaznica nije pronađena');
  const user = card.membership.user;
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  return {
    kind: 'membership' as const,
    id: card.id,
    status: card.membership.status,
    name,
  };
}
