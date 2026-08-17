import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsReadinessService } from '../payments-readiness.service';
import { PaypalOps } from '../paypal-ops';
import type { CheckoutSessionResult, PaymentProvider } from './payment-provider.interface';
import {
  formatPaypalAmount,
  paypalApproveUrl,
  paypalCustomId,
  withPaypalReturnUrl,
} from '../paypal-api.util';
import { paypalCreateOrder } from '../paypal-http.util';

@Injectable()
export class PaypalProvider implements PaymentProvider {
  readonly id = 'paypal';

  constructor(
    private readonly prisma: PrismaService,
    private readonly readiness: PaymentsReadinessService,
    private readonly ops: PaypalOps,
  ) {}

  isReady() {
    return this.readiness.isProviderReady('paypal');
  }

  async createTicketCheckout(orderId: string, successUrl: string, cancelUrl: string) {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        tickets: { include: { match: { include: { homeClub: true, awayClub: true } } } },
      },
    });
    if (!order?.payment) throw new BadRequestException('Narudžba nije pronađena');
    const match = order.tickets[0]?.match;
    const label = match
      ? `${match.homeClub?.name} vs ${match.awayClub?.name}`
      : 'Ulaznice FK Gračanica';
    const created = await this.startOrder({
      kind: 'tickets',
      refId: orderId,
      amount: Number(order.total),
      label,
      successUrl,
      cancelUrl,
    });
    await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        provider: 'paypal',
        externalId: created.sessionId,
        status: 'PENDING_ONLINE',
        method: 'paypal',
      },
    });
    return created;
  }

  async createMembershipCheckout(
    membershipId: string,
    amount: number,
    successUrl: string,
    cancelUrl: string,
  ) {
    return this.startOrder({
      kind: 'membership',
      refId: membershipId,
      amount,
      label: 'Članstvo FK Gračanica',
      successUrl,
      cancelUrl,
    });
  }

  async createSeasonPassCheckout(
    passId: string,
    amount: number,
    successUrl: string,
    cancelUrl: string,
  ) {
    return this.startOrder({
      kind: 'season',
      refId: passId,
      amount,
      label: 'Sezonska karta FK Gračanica',
      successUrl,
      cancelUrl,
    });
  }

  confirmTicketSession(sessionId: string, userId: string) {
    return this.ops.confirmTicket(sessionId, userId);
  }

  confirmMembershipSession(sessionId: string, userId: string) {
    return this.ops.confirmMembership(sessionId, userId);
  }

  confirmSeasonPassSession(sessionId: string, userId: string) {
    return this.ops.confirmSeasonPass(sessionId, userId);
  }

  handleWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>) {
    return this.ops.handleWebhook(rawBody, headers);
  }

  private async startOrder(input: {
    kind: 'tickets' | 'membership' | 'season';
    refId: string;
    amount: number;
    label: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSessionResult> {
    const ctx = await this.ops.ctx();
    const customId = paypalCustomId(input.kind, input.refId);
    const created = await paypalCreateOrder(ctx.baseUrl, ctx.token, {
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: customId,
          invoice_id: `${customId}-${Date.now()}`.slice(0, 127),
          description: input.label.slice(0, 127),
          amount: { currency_code: ctx.currency, value: formatPaypalAmount(input.amount) },
        },
      ],
      application_context: {
        brand_name: 'FK Gracanica',
        user_action: 'PAY_NOW',
        return_url: withPaypalReturnUrl(input.successUrl),
        cancel_url: input.cancelUrl,
      },
    });
    const url = paypalApproveUrl(created.links);
    if (!url) throw new BadRequestException('PayPal order nije kreiran');
    return { url, sessionId: created.id, provider: 'paypal' };
  }
}
