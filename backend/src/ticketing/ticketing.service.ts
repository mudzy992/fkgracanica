import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsReadinessService } from '../payments/payments-readiness.service';
import { TicketingOrdersService } from './ticketing-orders.service';
import { JobsService } from '../jobs/jobs.module';
import { notifyTicketPaid } from '../payments/payment-notify';
import {
  getMemberDiscountPercent,
  getStadiumCapacity,
  ticketOrderInclude,
} from './ticketing-query.util';
import { occupiedForMatch } from './season-pass-capacity.util';
import { validateSeasonPass } from './season-pass-validate.util';
import {
  countUserActiveTicketsForMatch,
  getMaxBoxOfficeTicketsPerUser,
} from './ticketing-user-limits.util';
import type { TicketPaymentIntent } from './ticketing-sales.util';

@Injectable()
export class TicketingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsReadinessService,
    private readonly orders: TicketingOrdersService,
    private readonly jobs: JobsService,
  ) {}

  reserve(
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
    return this.orders.reserve(userId, data);
  }

  requestRefund(orderId: string, userId: string) {
    return this.orders.requestRefund(orderId, userId);
  }

  async confirmBoxOfficePayment(orderId: string) {
    const order = await this.orders.confirmBoxOfficePayment(orderId);
    if (order) await notifyTicketPaid(this.prisma, this.jobs, orderId);
    return order;
  }

  confirmRefund(orderId: string) {
    return this.orders.confirmRefund(orderId);
  }

  adminCancelOrder(orderId: string) {
    return this.orders.adminCancelOrder(orderId);
  }

  cancelOrder(orderId: string, userId: string) {
    return this.orders.cancelOrder(orderId, userId);
  }

  async validateTicket(qrCode: string, matchId?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: { match: { include: { homeClub: true, awayClub: true } } },
    });
    if (!ticket) return validateSeasonPass(this.prisma, qrCode, matchId);
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
    }).then((row) => ({ kind: 'ticket' as const, ...row }));
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
    const capacity = await getStadiumCapacity(this.prisma);
    const occupied = await occupiedForMatch(this.prisma, matchId);
    const memberDiscountPercent = userId ? await getMemberDiscountPercent(this.prisma, userId) : 0;
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
      sold: occupied.sold,
      passes: occupied.passes,
      remaining: Math.max(0, capacity - occupied.occupied),
      memberDiscountPercent,
      userTickets,
      maxPerUser,
      userRemainingQuota,
      onlineUnlimited: sales.online,
      unlimitedPerUser: sales.online,
      salesModes: { boxOffice: sales.boxOffice, online: sales.online },
    };
  }

  findOrders(userId: string) {
    return this.prisma.ticketOrder.findMany({
      where: { userId },
      include: ticketOrderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.ticketOrder.findMany({
      skip,
      take: limit,
      include: ticketOrderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderById(orderId: string) {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: ticketOrderInclude,
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    return order;
  }
}
