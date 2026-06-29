import { generateQrCode } from '../common/utils/qr.util';
import type { PrismaService } from '../prisma/prisma.service';

export async function confirmTicketOrderFlow(prisma: PrismaService, orderId: string): Promise<boolean> {
  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order?.payment) return false;
  if (order.status === 'paid' && order.payment.status === 'CONFIRMED') return true;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: order.payment.id },
      data: { status: 'CONFIRMED', confirmedAt: new Date() },
    }),
    prisma.ticket.updateMany({
      where: { orderId },
      data: { status: 'PAID_AT_BOX_OFFICE' },
    }),
    prisma.ticketOrder.update({ where: { id: orderId }, data: { status: 'paid' } }),
  ]);
  return true;
}

export async function confirmMembershipFlow(prisma: PrismaService, membershipId: string): Promise<boolean> {
  const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!membership) return false;

  if (membership.status === 'ACTIVE') {
    const base =
      membership.endDate && membership.endDate > new Date() ? membership.endDate : new Date();
    await prisma.membership.update({
      where: { id: membershipId },
      data: { endDate: new Date(base.getTime() + 365 * 24 * 60 * 60 * 1000) },
    });
  } else {
    await prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const cardNumber = `FK-${membershipId.slice(-8).toUpperCase()}`;
  await prisma.membershipCard.upsert({
    where: { membershipId },
    create: {
      membershipId,
      cardNumber,
      qrCode: generateQrCode(`member-${membershipId}`),
    },
    update: {},
  });
  return true;
}
