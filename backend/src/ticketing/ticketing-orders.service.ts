import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, TicketStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateQrCode } from '../common/utils/qr.util';
import { PaymentsReadinessService } from '../payments/payments-readiness.service';
import { TicketingConfigService } from './ticketing-config.service';
import {
  findCategoryByLabel,
  findCategoryById,
} from './ticket-categories.util';
import { assertBoxOfficeTicketLimit } from './ticketing-user-limits.util';
import {
  resolvePaymentIntent,
  usesBoxOfficeLimit,
  type TicketPaymentIntent,
} from './ticketing-sales.util';
import {
  getMemberDiscountPercent,
  getStadiumCapacity,
  ticketOrderInclude,
} from './ticketing-query.util';
import { occupiedForMatch } from './season-pass-capacity.util';

@Injectable()
export class TicketingOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: TicketingConfigService,
    private readonly payments: PaymentsReadinessService,
  ) {}

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
    if (!active)
      throw new BadRequestException(
        'Trenutno nema zakazane domaće utakmice za ulaznice',
      );
    const matchId =
      data.matchId && data.matchId === active.id ? data.matchId : active.id;

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { homeClub: { select: { isOwnClub: true } } },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    if (!match.homeClub?.isOwnClub) {
      throw new BadRequestException(
        'Ulaznice su dostupne samo za domaće utakmice',
      );
    }

    const categories = await this.config.getCategories();
    const cat =
      (data.categoryId
        ? findCategoryById(categories, data.categoryId)
        : null) ??
      findCategoryByLabel(categories, data.category) ??
      findCategoryById(categories, data.category);
    if (!cat || cat.isActive === false)
      throw new BadRequestException('Nepoznata kategorija ulaznice');

    const qty = data.quantity ?? 1;
    if (usesBoxOfficeLimit(intent)) {
      await assertBoxOfficeTicketLimit(this.prisma, userId, matchId, qty);
    }
    const discount = await getMemberDiscountPercent(this.prisma, userId);
    const unitPrice =
      discount > 0 ? cat.price * (1 - discount / 100) : cat.price;
    const capacity = await getStadiumCapacity(this.prisma);
    const occupied = await occupiedForMatch(this.prisma, matchId);
    if (occupied.occupied + qty > capacity)
      throw new BadRequestException('Kapacitet stadiona je popunjen');

    const total = new Prisma.Decimal(unitPrice * qty);
    return this.prisma.ticketOrder.create({
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
          create: { amount: total, status: PaymentStatus.PENDING_BOX_OFFICE },
        },
      },
      include: { tickets: true, payment: true },
    });
  }

  /**
   * BE-07/P-B07-6: povrat je moguć samo za **plaćenu** narudžbu čije ulaznice
   * nisu iskorištene. Prije se mogao zatražiti povrat za neplaćenu (`pending`)
   * narudžbu — i time ugasiti ulaznice bez ikakve uplate.
   */
  async requestRefund(orderId: string, userId: string) {
    const order = await this.prisma.ticketOrder.findFirst({
      where: { id: orderId, userId },
      include: { tickets: true, payment: true },
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    if (order.status !== 'paid' || order.payment?.status !== 'CONFIRMED') {
      throw new BadRequestException('Povrat je moguć samo za plaćenu narudžbu');
    }
    if (order.tickets.some((t) => t.status === TicketStatus.USED)) {
      throw new BadRequestException(
        'Ulaznice su već iskorištene — povrat nije moguć',
      );
    }
    await this.prisma.ticket.updateMany({
      where: { orderId },
      data: { status: TicketStatus.REFUND_REQUESTED },
    });
    return this.prisma.ticketOrder.update({
      where: { id: orderId },
      data: { status: 'refund_requested' },
      include: { tickets: true },
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
    await this.prisma.$transaction([
      this.prisma.ticket.updateMany({
        where: { orderId },
        data: { status: TicketStatus.CANCELLED },
      }),
      this.prisma.ticketOrder.update({
        where: { id: orderId },
        data: { status: 'refunded' },
      }),
    ]);
    if (order.payment) {
      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });
    }
    return this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: {
        tickets: true,
        payment: true,
        user: { select: { email: true } },
      },
    });
  }

  async adminCancelOrder(orderId: string) {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    if (order.status === 'cancelled' || order.status === 'refunded') {
      throw new BadRequestException('Narudžba je već zatvorena');
    }
    // BE-07/P-B07-6: plaćena narudžba ide kroz povrat (novac nazad + evidencija).
    if (order.status === 'paid' || order.status === 'refund_requested') {
      throw new BadRequestException(
        'Plaćena narudžba se ne otkazuje — koristite povrat',
      );
    }
    await this.prisma.ticket.updateMany({
      where: { orderId },
      data: { status: TicketStatus.CANCELLED },
    });
    if (order.status === 'pending') {
      const payment = await this.prisma.payment.findUnique({
        where: { orderId },
      });
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
      include: ticketOrderInclude,
    });
  }

  /**
   * BE-07/P-B07-6: korisnik može otkazati samo **neplaćenu** narudžbu.
   * Plaćena ide kroz `requestRefund` (novac se vraća, evidencija ostaje tačna);
   * prije je otkazivanje plaćene narudžbe ostavljalo payment `CONFIRMED`,
   * a ulaznice `CANCELLED`.
   */
  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.ticketOrder.findFirst({
      where: { id: orderId, userId },
      include: { payment: true },
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    if (order.status !== 'pending' || order.payment?.status === 'CONFIRMED') {
      throw new BadRequestException(
        'Plaćena narudžba se ne može otkazati — zatražite povrat',
      );
    }
    await this.prisma.ticket.updateMany({
      where: { orderId },
      data: { status: TicketStatus.CANCELLED },
    });
    if (order.payment) {
      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: PaymentStatus.CANCELLED },
      });
    }
    return this.prisma.ticketOrder.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
      include: { tickets: true, payment: true },
    });
  }
}
