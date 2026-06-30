import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, TicketStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateQrCode } from '../common/utils/qr.util';
import { PaymentsReadinessService } from '../payments/payments-readiness.service';
import { TicketingConfigService } from './ticketing-config.service';
import { findCategoryByLabel, findCategoryById } from './ticket-categories.util';
import {
  assertBoxOfficeTicketLimit,
  countUserActiveTicketsForMatch,
  getMaxBoxOfficeTicketsPerUser,
} from './ticketing-user-limits.util';
import {
  resolvePaymentIntent,
  usesBoxOfficeLimit,
  type TicketPaymentIntent,
} from './ticketing-sales.util';

const DEFAULT_CAPACITY = 5000;

const orderInclude = {
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
  tickets: {
    include: {
      match: {
        include: {
          homeClub: true,
          awayClub: true,
          roundRel: { select: { id: true, number: true, name: true } },
          season: {
            select: {
              name: true,
              competition: { select: { name: true } },
            },
          },
        },
      },
    },
  },
  payment: true,
} as const;

@Injectable()
export class TicketingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: TicketingConfigService,
    private readonly payments: PaymentsReadinessService,
  ) {}

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

  async reserve(
    userId: string,
    data: {
      matchId?: string;
      category: string;
      price: number;
      quantity?: number;
      categoryId?: string;
      paymentIntent?: TicketPaymentIntent;
    },
  ) {
    const sales = await this.payments.getSalesModes();
    const intent = resolvePaymentIntent(sales, data.paymentIntent);

    const active = await this.config.findActiveScheduledHomeMatch();
    if (!active) {
      throw new BadRequestException('Trenutno nema zakazane domaće utakmice za ulaznice');
    }
    const matchId = data.matchId && data.matchId === active.id ? data.matchId : active.id;

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { homeClub: { select: { isOwnClub: true } } },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    if (!match.homeClub?.isOwnClub) {
      throw new BadRequestException('Ulaznice su dostupne samo za domaće utakmice');
    }

    const categories = await this.config.getCategories();
    const cat =
      (data.categoryId ? findCategoryById(categories, data.categoryId) : null) ??
      findCategoryByLabel(categories, data.category) ??
      findCategoryById(categories, data.category);
    if (!cat || cat.isActive === false) {
      throw new BadRequestException('Nepoznata kategorija ulaznice');
    }

    const qty = data.quantity ?? 1;
    if (usesBoxOfficeLimit(intent)) {
      await assertBoxOfficeTicketLimit(this.prisma, userId, matchId, qty);
    }
    const discount = await this.getMemberDiscountPercent(userId);
    const unitPrice = discount > 0 ? cat.price * (1 - discount / 100) : cat.price;
    const capacity = await this.getCapacity();
    const sold = await this.countSoldForMatch(matchId);
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
            matchId,
            category: cat.label,
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

  async getMatchAvailability(matchId: string, userId?: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { homeClub: { select: { isOwnClub: true } } },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    if (!match.homeClub?.isOwnClub) {
      throw new BadRequestException('Ulaznice nisu dostupne za ovu utakmicu');
    }
    const capacity = await this.getCapacity();
    const sold = await this.countSoldForMatch(matchId);
    const memberDiscountPercent = userId ? await this.getMemberDiscountPercent(userId) : 0;
    const sales = await this.payments.getSalesModes();
    let userTickets = 0;
    let maxPerUser: number | null = null;
    let userRemainingQuota: number | null = null;
    if (userId) {
      userTickets = await countUserActiveTicketsForMatch(this.prisma, userId, matchId);
      if (sales.boxOffice) {
        maxPerUser = await getMaxBoxOfficeTicketsPerUser(this.prisma);
        userRemainingQuota = Math.max(0, maxPerUser - userTickets);
      }
    }
    return {
      matchId,
      capacity,
      sold,
      remaining: Math.max(0, capacity - sold),
      memberDiscountPercent,
      userTickets,
      maxPerUser,
      userRemainingQuota,
      onlineUnlimited: sales.online,
      unlimitedPerUser: sales.online,
      salesModes: { boxOffice: sales.boxOffice, online: sales.online },
    };
  }

  async adminCancelOrder(orderId: string) {
    const order = await this.prisma.ticketOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    if (order.status === 'cancelled' || order.status === 'refunded') {
      throw new BadRequestException('Narudžba je već zatvorena');
    }
    await this.prisma.ticket.updateMany({
      where: { orderId },
      data: { status: TicketStatus.CANCELLED },
    });
    if (order.status === 'pending') {
      const payment = await this.prisma.payment.findUnique({ where: { orderId } });
      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.CANCELLED },
        });
      }
    }
    return this.prisma.ticketOrder.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
      include: orderInclude,
    });
  }

  findOrders(userId: string) {
    return this.prisma.ticketOrder.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.ticketOrder.findMany({
      skip,
      take: limit,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderById(orderId: string) {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: orderInclude,
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
