import { Injectable } from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateQrCode } from '../common/utils/qr.util';

@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  register(userId: string) {
    return this.prisma.membership.create({
      data: { userId, status: MembershipStatus.PENDING },
    });
  }

  findForUser(userId: string) {
    return this.prisma.membership.findMany({
      where: { userId },
      include: { card: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.membership.findMany({
      include: { user: { select: { id: true, email: true } }, card: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async activate(id: string) {
    const membership = await this.prisma.membership.update({
      where: { id },
      data: {
        status: MembershipStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    const cardNumber = `FK-${membership.id.slice(-8).toUpperCase()}`;
    const card = await this.prisma.membershipCard.upsert({
      where: { membershipId: id },
      create: {
        membershipId: id,
        cardNumber,
        qrCode: generateQrCode('member'),
      },
      update: {},
    });
    return { membership, card };
  }
}
