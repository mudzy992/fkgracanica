import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentsReadinessService } from './payments-readiness.service';
import { MembershipService } from '../membership/membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeProvider } from './providers/stripe.provider';
import { PaypalProvider } from './providers/paypal.provider';
import { MonriProvider } from './providers/monri.provider';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly readiness: PaymentsReadinessService,
    private readonly membership: MembershipService,
    private readonly prisma: PrismaService,
    private readonly stripe: StripeProvider,
    private readonly paypal: PaypalProvider,
    private readonly monri: MonriProvider,
  ) {}

  private async resolveProvider() {
    const id = await this.readiness.getDefaultProvider();
    const map = { stripe: this.stripe, paypal: this.paypal, monri: this.monri } as const;
    const provider = map[id];
    if (!(await provider.isReady())) {
      throw new BadRequestException('Online plaćanje nije konfigurisano');
    }
    return provider;
  }

  async checkoutTickets(orderId: string, successUrl: string, cancelUrl: string, userId: string) {
    const sales = await this.readiness.getSalesModes();
    if (!sales.online) throw new BadRequestException('Online kupovina ulaznica nije omogućena');
    const order = await this.prisma.ticketOrder.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    if (order.status !== 'pending') {
      throw new BadRequestException('Narudžba nije dostupna za online plaćanje');
    }
    const provider = await this.resolveProvider();
    return provider.createTicketCheckout(orderId, successUrl, cancelUrl);
  }

  async checkoutMembership(
    membershipId: string,
    amount: number,
    successUrl: string,
    cancelUrl: string,
    userId: string,
  ) {
    const allowed = await this.readiness.isMembershipOnlineAllowed();
    if (!allowed) throw new BadRequestException('Online članstvo nije omogućeno');
    await this.membership.assertPayableMembership(membershipId, userId);
    const provider = await this.resolveProvider();
    return provider.createMembershipCheckout(membershipId, amount, successUrl, cancelUrl);
  }

  handleStripeWebhook(rawBody: Buffer, signature: string) {
    return this.stripe.handleWebhook(rawBody, signature);
  }

  confirmMembershipSession(sessionId: string, userId: string) {
    return this.stripe.confirmMembershipSession(sessionId, userId);
  }

  confirmTicketSession(sessionId: string, userId: string) {
    return this.stripe.confirmTicketSession(sessionId, userId);
  }
}
