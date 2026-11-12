import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsReadinessService } from '../payments/payments-readiness.service';
import { TicketingOrdersService } from './ticketing-orders.service';
import { JobsService } from '../jobs/jobs.module';
import { NotificationsService } from '../notifications/notifications.service';
import { notifyTicketPaid } from '../payments/payment-notify';
import {
  getMemberDiscountPercent,
  getStadiumCapacity,
  ticketOrderInclude,
} from './ticketing-query.util';
import { occupiedForMatch } from './season-pass-capacity.util';
import { scanAdmission } from './admission-scan';
import {
  countUserActiveTicketsForMatch,
  getMaxBoxOfficeTicketsPerUser,
} from './ticketing-user-limits.util';
import type { TicketPaymentIntent } from './ticketing-sales.util';
import type { AuthUser } from '../common/types/auth-user.type';

@Injectable()
export class TicketingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsReadinessService,
    private readonly orders: TicketingOrdersService,
    private readonly jobs: JobsService,
    private readonly notifications: NotificationsService,
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
    if (order)
      await notifyTicketPaid(
        this.prisma,
        this.jobs,
        orderId,
        this.notifications,
      );
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

  inspectTicket(qrCode: string, matchId?: string) {
    return scanAdmission(this.prisma, qrCode, matchId, false);
  }

  validateTicket(qrCode: string, matchId?: string) {
    return scanAdmission(this.prisma, qrCode, matchId, true);
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
    const memberDiscountPercent = userId
      ? await getMemberDiscountPercent(this.prisma, userId)
      : 0;
    const sales = await this.payments.getSalesModes();
    let userTickets = 0;
    let maxPerUser: number | null = null;
    let userRemainingQuota: number | null = null;
    if (userId) {
      userTickets = await countUserActiveTicketsForMatch(
        this.prisma,
        userId,
        matchId,
      );
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

  /**
   * BE-07/P-B07-3: narudžbu vidi samo vlasnik ili `ticketing.manage`.
   * Prije je `user` bio ignorisan → bilo koji prijavljeni korisnik je mogao
   * pročitati tuđu narudžbu **sa svim QR kodovima** (ulaz bez plaćanja).
   * Za neovlaštene: 404 (ne otkrivamo ni postojanje narudžbe).
   */
  async findOrderById(orderId: string, user: AuthUser) {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: ticketOrderInclude,
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    const canManage = (user?.permissions ?? []).includes('ticketing.manage');
    if (order.userId !== user?.id && !canManage) {
      throw new NotFoundException('Narudžba nije pronađena');
    }
    return order;
  }
}
