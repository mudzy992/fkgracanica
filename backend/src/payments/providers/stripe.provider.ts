import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsReadinessService } from '../payments-readiness.service';
import { confirmMembershipFlow, confirmTicketOrderFlow } from '../stripe-confirm.flow';
import { notifyMembershipActive, notifyTicketPaid } from '../payment-notify';
import { JobsService } from '../../jobs/jobs.module';
import type { CheckoutSessionResult, PaymentProvider } from './payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly id = 'stripe';

  constructor(
    private readonly prisma: PrismaService,
    private readonly readiness: PaymentsReadinessService,
    private readonly jobs: JobsService,
  ) {}

  isReady() {
    return this.readiness.isProviderReady('stripe');
  }

  private async client(): Promise<Stripe> {
    const row = await this.prisma.setting.findUnique({ where: { key: 'payments.stripe.secretKey' } });
    const key = row?.value?.trim();
    if (!key) throw new BadRequestException('Stripe nije konfigurisan');
    return new Stripe(key);
  }

  async createTicketCheckout(
    orderId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutSessionResult> {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: { payment: true, tickets: { include: { match: { include: { homeClub: true, awayClub: true } } } } },
    });
    if (!order?.payment) throw new BadRequestException('Narudžba nije pronađena');
    const stripe = await this.client();
    const match = order.tickets[0]?.match;
    const label = match
      ? `${match.homeClub?.name} vs ${match.awayClub?.name}`
      : 'Ulaznice FK Gračanica';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'bam',
            unit_amount: Math.round(Number(order.total) * 100),
            product_data: { name: label },
          },
        },
      ],
      metadata: { orderId, type: 'tickets' },
    });

    await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        provider: 'stripe',
        externalId: session.id,
        status: 'PENDING_ONLINE',
        method: 'stripe',
      },
    });

    if (!session.url) throw new BadRequestException('Stripe session nije kreiran');
    return { url: session.url, sessionId: session.id, provider: 'stripe' };
  }

  async createMembershipCheckout(
    membershipId: string,
    amount: number,
    successUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutSessionResult> {
    const stripe = await this.client();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'bam',
            unit_amount: Math.round(amount * 100),
            product_data: { name: 'Članstvo FK Gračanica' },
          },
        },
      ],
      metadata: { membershipId, type: 'membership' },
    });
    if (!session.url) throw new BadRequestException('Stripe session nije kreiran');
    return { url: session.url, sessionId: session.id, provider: 'stripe' };
  }

  async confirmTicketSession(sessionId: string, userId: string) {
    const stripe = await this.client();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const meta = session.metadata ?? {};
    if (meta.type !== 'tickets' || !meta.orderId) {
      throw new BadRequestException('Neispravna sesija plaćanja');
    }

    const order = await this.prisma.ticketOrder.findFirst({
      where: { id: meta.orderId, userId },
    });
    if (!order) throw new BadRequestException('Narudžba nije pronađena');

    if (session.payment_status === 'paid') {
      const fresh = await confirmTicketOrderFlow(this.prisma, meta.orderId);
      if (fresh) await notifyTicketPaid(this.prisma, this.jobs, meta.orderId);
      return { orderId: meta.orderId, status: 'paid' as const };
    }

    return {
      orderId: meta.orderId,
      status: order.status,
      paymentStatus: session.payment_status,
    };
  }

  async confirmMembershipSession(sessionId: string, userId: string) {
    const stripe = await this.client();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const meta = session.metadata ?? {};
    if (meta.type !== 'membership' || !meta.membershipId) {
      throw new BadRequestException('Neispravna sesija plaćanja');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { id: meta.membershipId, userId },
    });
    if (!membership) throw new BadRequestException('Članstvo nije pronađeno');

    if (session.payment_status === 'paid') {
      const fresh = await confirmMembershipFlow(this.prisma, meta.membershipId);
      if (fresh) await notifyMembershipActive(this.prisma, this.jobs, meta.membershipId);
      return { membershipId: meta.membershipId, status: 'ACTIVE' as const };
    }

    return {
      membershipId: meta.membershipId,
      status: membership.status,
      paymentStatus: session.payment_status,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secretRow = await this.prisma.setting.findUnique({
      where: { key: 'payments.stripe.webhookSecret' },
    });
    const webhookSecret = secretRow?.value?.trim();
    if (!webhookSecret) throw new BadRequestException('Webhook secret nije postavljen');

    const stripe = await this.client();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== 'paid') return { received: true };
      const meta = session.metadata ?? {};
      if (meta.type === 'tickets' && meta.orderId) {
        const fresh = await confirmTicketOrderFlow(this.prisma, meta.orderId);
        if (fresh) await notifyTicketPaid(this.prisma, this.jobs, meta.orderId);
      }
      if (meta.type === 'membership' && meta.membershipId) {
        const fresh = await confirmMembershipFlow(this.prisma, meta.membershipId);
        if (fresh) await notifyMembershipActive(this.prisma, this.jobs, meta.membershipId);
      }
    }
    return { received: true };
  }
}
