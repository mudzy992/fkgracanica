import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  PaymentsReadinessService,
  type PaymentProviderId,
} from './payments-readiness.service';
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

  private async resolveProvider(explicit?: PaymentProviderId) {
    const map = {
      stripe: this.stripe,
      paypal: this.paypal,
      monri: this.monri,
    } as const;
    if (explicit) {
      const provider = map[explicit];
      if (!(await provider.isReady())) {
        throw new BadRequestException('Odabrani način plaćanja nije dostupan');
      }
      return provider;
    }
    const ready = await this.readiness.getReadyProviders();
    if (ready.length === 1) return map[ready[0]];
    const id = await this.readiness.getDefaultProvider();
    const provider = map[id];
    if (!(await provider.isReady())) {
      throw new BadRequestException('Online plaćanje nije konfigurisano');
    }
    return provider;
  }

  async checkoutTickets(
    orderId: string,
    successUrl: string,
    cancelUrl: string,
    userId: string,
    providerId?: PaymentProviderId,
  ) {
    const sales = await this.readiness.getSalesModes();
    if (!sales.online)
      throw new BadRequestException('Online kupovina ulaznica nije omogućena');
    const order = await this.prisma.ticketOrder.findFirst({
      where: { id: orderId, userId },
    });
    if (!order) throw new NotFoundException('Narudžba nije pronađena');
    if (order.status !== 'pending') {
      throw new BadRequestException(
        'Narudžba nije dostupna za online plaćanje',
      );
    }
    const provider = await this.resolveProvider(providerId);
    return provider.createTicketCheckout(orderId, successUrl, cancelUrl);
  }

  async checkoutMembership(
    membershipId: string,
    amount: number,
    successUrl: string,
    cancelUrl: string,
    userId: string,
    providerId?: PaymentProviderId,
  ) {
    const allowed = await this.readiness.isMembershipOnlineAllowed();
    if (!allowed)
      throw new BadRequestException('Online članstvo nije omogućeno');
    await this.membership.assertPayableMembership(membershipId, userId);
    const provider = await this.resolveProvider(providerId);
    return provider.createMembershipCheckout(
      membershipId,
      amount,
      successUrl,
      cancelUrl,
    );
  }

  async checkoutSeasonPass(
    passId: string,
    successUrl: string,
    cancelUrl: string,
    userId: string,
    providerId?: PaymentProviderId,
  ) {
    const sales = await this.readiness.getSalesModes();
    if (!sales.online)
      throw new BadRequestException('Online kupovina ulaznica nije omogućena');
    const pass = await this.prisma.seasonPass.findFirst({
      where: { id: passId, userId },
    });
    if (!pass) throw new NotFoundException('Sezonska karta nije pronađena');
    if (pass.status !== 'PENDING') {
      throw new BadRequestException('Ova karta nije dostupna za online uplatu');
    }
    const provider = await this.resolveProvider(providerId);
    return provider.createSeasonPassCheckout(
      passId,
      Number(pass.price),
      successUrl,
      cancelUrl,
    );
  }

  handleStripeWebhook(rawBody: Buffer, signature: string) {
    return this.stripe.handleWebhook(rawBody, signature);
  }

  handlePaypalWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ) {
    return this.paypal.handleWebhook(rawBody, headers);
  }

  handleMonriWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ) {
    return this.monri.handleWebhook(rawBody, headers);
  }

  getMonriForm(sessionId: string, userId: string, origin: string) {
    return this.monri.getForm(sessionId, userId, origin);
  }

  async confirmMembershipSession(
    sessionId: string,
    userId: string,
    provider?: PaymentProviderId,
    returnUrl?: string,
  ) {
    const id =
      provider ?? (await this.providerFromExternalId(sessionId)) ?? 'stripe';
    if (id === 'paypal')
      return this.paypal.confirmMembershipSession(sessionId, userId);
    if (id === 'monri')
      return this.monri.confirmMembershipSession(sessionId, userId, returnUrl);
    if (id === 'stripe')
      return this.stripe.confirmMembershipSession(sessionId, userId);
    throw new NotImplementedException(`${String(id)} confirm u pripremi`);
  }

  async confirmTicketSession(
    sessionId: string,
    userId: string,
    provider?: PaymentProviderId,
    returnUrl?: string,
  ) {
    const id =
      provider ?? (await this.providerFromExternalId(sessionId)) ?? 'stripe';
    if (id === 'paypal')
      return this.paypal.confirmTicketSession(sessionId, userId);
    if (id === 'monri')
      return this.monri.confirmTicketSession(sessionId, userId, returnUrl);
    if (id === 'stripe')
      return this.stripe.confirmTicketSession(sessionId, userId);
    throw new NotImplementedException(`${String(id)} confirm u pripremi`);
  }

  async confirmSeasonPassSession(
    sessionId: string,
    userId: string,
    provider?: PaymentProviderId,
    returnUrl?: string,
  ) {
    const id =
      provider ?? (await this.providerFromExternalId(sessionId)) ?? 'stripe';
    if (id === 'paypal')
      return this.paypal.confirmSeasonPassSession(sessionId, userId);
    if (id === 'monri')
      return this.monri.confirmSeasonPassSession(sessionId, userId, returnUrl);
    if (id === 'stripe')
      return this.stripe.confirmSeasonPassSession(sessionId, userId);
    throw new NotImplementedException(`${String(id)} confirm u pripremi`);
  }

  private async providerFromExternalId(
    sessionId: string,
  ): Promise<PaymentProviderId | undefined> {
    const payment = await this.prisma.payment.findFirst({
      where: { externalId: sessionId },
    });
    if (
      payment?.provider === 'paypal' ||
      payment?.provider === 'monri' ||
      payment?.provider === 'stripe'
    ) {
      return payment.provider;
    }
    return undefined;
  }
}
