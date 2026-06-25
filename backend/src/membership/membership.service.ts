import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
        qrCode: generateQrCode(`member-${id}`),
      },
      update: {},
    });
    return { membership, card };
  }

  async renew(id: string) {
    const membership = await this.prisma.membership.findUnique({ where: { id } });
    if (!membership) throw new NotFoundException('Članstvo nije pronađeno');
    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('Samo aktivno članstvo se može obnoviti');
    }
    const base = membership.endDate && membership.endDate > new Date() ? membership.endDate : new Date();
    const endDate = new Date(base.getTime() + 365 * 24 * 60 * 60 * 1000);
    return this.prisma.membership.update({
      where: { id },
      data: { endDate, status: MembershipStatus.ACTIVE },
      include: { card: true },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.membership.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } }, card: true },
    });
    if (!item) throw new NotFoundException('Članstvo nije pronađeno');
    return item;
  }

  suspend(id: string) {
    return this.prisma.membership.update({
      where: { id },
      data: { status: MembershipStatus.SUSPENDED },
      include: { card: true },
    });
  }

  cancel(id: string) {
    return this.prisma.membership.update({
      where: { id },
      data: { status: MembershipStatus.CANCELLED },
      include: { card: true },
    });
  }
}
