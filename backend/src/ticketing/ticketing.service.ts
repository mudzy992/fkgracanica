import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, TicketStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateQrCode } from '../common/utils/qr.util';

const DEFAULT_CAPACITY = 5000;

@Injectable()
export class TicketingService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCapacity(): Promise<number> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'ticketing.stadiumCapacity' },
    });
    return setting ? Number(setting.value) || DEFAULT_CAPACITY : DEFAULT_CAPACITY;
  }

  private async countSoldForMatch(matchId: string) {
    return this.prisma.ticket.count({
      where: {
        matchId,
        status: { notIn: [TicketStatus.CANCELLED] },
      },
    });
  }

  private async getMemberDiscountPercent(userId: string): Promise<number> {
    const active = await this.prisma.membership.findFirst({
      where: { userId, status: 'ACTIVE' },
    });
    if (!active) return 0;
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'ticketing.memberDiscountPercent' },
    });
    return setting ? Number(setting.value) || 0 : 10;
  }

  async reserve(userId: string, data: { matchId: string; category: string; price: number; quantity?: number }) {
    const qty = data.quantity ?? 1;
    const discount = await this.getMemberDiscountPercent(userId);
    const unitPrice = discount > 0 ? data.price * (1 - discount / 100) : data.price;
    const capacity = await this.getCapacity();
    const sold = await this.countSoldForMatch(data.matchId);
    if (sold + qty > capacity) {
      throw new BadRequestException('Kapacitet stadiona je popunjen');
    }

    const total = new Prisma.Decimal(unitPrice * qty);
    const order = await this.prisma.ticketOrder.create({
      data: {
        userId,
        total,
        tickets: {
          create: Array.from({ length: qty }).map(() => ({
            matchId: data.matchId,
            category: data.category,
            price: new Prisma.Decimal(unitPrice),
            qrCode: generateQrCode('ticket'),
            status: TicketStatus.RESERVED,
          })),
        },
        payment: {
          create: {
            amount: total,
            status: PaymentStatus.PENDING_BOX_OFFICE,
          },
        },
      },
      include: { tickets: true, payment: true },
    });
    return order;
  }

  async requestRefund(orderId: string, userId: string) {
    const order = await this.prisma.ticketOrder.findFirst({
      where: { id: orderId, userId },
      include: { tickets: true },
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    await this.prisma.ticket.updateMany({
      where: { orderId },
      data: { status: TicketStatus.CANCELLED },
    });
    return this.prisma.ticketOrder.update({
      where: { id: orderId },
      data: { status: 'refund_requested' },
      include: { tickets: true },
    });
  }

  async validateTicket(qrCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: { match: { include: { homeClub: true, awayClub: true } } },
    });
    if (!ticket) throw new NotFoundException('Ulaznica nije pronađena');
    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException('Ulaznica je već iskorištena');
    }
    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException('Ulaznica je otkazana');
    }
    if (ticket.status === TicketStatus.RESERVED) {
      throw new BadRequestException('Ulaznica nije plaćena');
    }
    if (ticket.status !== TicketStatus.PAID_AT_BOX_OFFICE) {
      throw new BadRequestException('Ulaznica nije validna');
    }

    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.USED },
      include: { match: { include: { homeClub: true, awayClub: true } } },
    });
  }

  async confirmBoxOfficePayment(orderId: string) {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: { payment: true, tickets: true },
    });
    if (!order?.payment) throw new NotFoundException('Narudžba nije pronađena');

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: PaymentStatus.CONFIRMED, confirmedAt: new Date() },
      }),
      this.prisma.ticket.updateMany({
        where: { orderId },
        data: { status: TicketStatus.PAID_AT_BOX_OFFICE },
      }),
      this.prisma.ticketOrder.update({
        where: { id: orderId },
        data: { status: 'paid' },
      }),
    ]);

    return this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: { tickets: true, payment: true },
    });
  }

  async confirmRefund(orderId: string) {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    if (order.status !== 'refund_requested') {
      throw new BadRequestException('Narudžba nije u statusu za povrat');
    }
    await this.prisma.ticketOrder.update({
      where: { id: orderId },
      data: { status: 'refunded' },
    });
    if (order.payment) {
      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });
    }
    return this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: { tickets: true, payment: true, user: { select: { email: true } } },
    });
  }

  findOrders(userId: string) {
    return this.prisma.ticketOrder.findMany({
      where: { userId },
      include: { tickets: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.ticketOrder.findMany({
      skip,
      take: limit,
      include: {
        user: { select: { id: true, email: true } },
        tickets: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderById(orderId: string) {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: { tickets: true, payment: true, user: { select: { id: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    return order;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.ticketOrder.findFirst({
      where: { id: orderId, userId },
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    await this.prisma.ticket.updateMany({
      where: { orderId },
      data: { status: TicketStatus.CANCELLED },
    });
    return this.prisma.ticketOrder.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
      include: { tickets: true, payment: true },
    });
  }
}
