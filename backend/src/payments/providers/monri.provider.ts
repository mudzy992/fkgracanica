import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsReadinessService } from '../payments-readiness.service';
import { MonriOps } from '../monri-ops';
import type {
  CheckoutSessionResult,
  PaymentProvider,
} from './payment-provider.interface';
import {
  monriFormDigest,
  monriFormUrl,
  monriOrderNumber,
  parseMonriRef,
  toMinorUnits,
  withMonriReturnUrl,
} from '../monri-digest.util';
import { readMembershipAmount } from '../membership-price.util';
import { allowedOrigins, isAllowedPaymentOrigin } from '../payment-origin.util';

export type MonriFormPayload = {
  action: string;
  fields: Record<string, string>;
};

type MonriUser = {
  email: string;
  firstName: string | null;
  lastName: string | null;
};

@Injectable()
export class MonriProvider implements PaymentProvider {
  readonly id = 'monri';

  constructor(
    private readonly prisma: PrismaService,
    private readonly readiness: PaymentsReadinessService,
    private readonly ops: MonriOps,
    private readonly config: ConfigService,
  ) {}

  isReady() {
    return this.readiness.isProviderReady('monri');
  }

  async createTicketCheckout(
    orderId: string,
    successUrl: string,
    _cancelUrl: string,
  ) {
    const order = await this.prisma.ticketOrder.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order?.payment)
      throw new BadRequestException('Narudžba nije pronađena');
    const orderNumber = monriOrderNumber('tickets', orderId);
    await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        provider: 'monri',
        externalId: orderNumber,
        status: 'PENDING_ONLINE',
        method: 'monri',
      },
    });
    return this.bridgeUrl(successUrl, orderNumber);
  }

  createMembershipCheckout(
    membershipId: string,
    _amount: number,
    successUrl: string,
    _cancelUrl: string,
  ): Promise<CheckoutSessionResult> {
    return Promise.resolve(
      this.bridgeUrl(successUrl, monriOrderNumber('membership', membershipId)),
    );
  }

  createSeasonPassCheckout(
    passId: string,
    _amount: number,
    successUrl: string,
    _cancelUrl: string,
  ): Promise<CheckoutSessionResult> {
    return Promise.resolve(
      this.bridgeUrl(successUrl, monriOrderNumber('season', passId)),
    );
  }

  confirmTicketSession(sessionId: string, userId: string, returnUrl?: string) {
    return this.ops.confirmTicket(sessionId, userId, returnUrl);
  }

  confirmMembershipSession(
    sessionId: string,
    userId: string,
    returnUrl?: string,
  ) {
    return this.ops.confirmMembership(sessionId, userId, returnUrl);
  }

  confirmSeasonPassSession(
    sessionId: string,
    userId: string,
    returnUrl?: string,
  ) {
    return this.ops.confirmSeasonPass(sessionId, userId, returnUrl);
  }

  handleWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ) {
    return this.ops.handleWebhook(rawBody, headers);
  }

  async getForm(
    sessionId: string,
    userId: string,
    origin: string,
  ): Promise<MonriFormPayload> {
    const ref = parseMonriRef(sessionId);
    if (!ref) throw new BadRequestException('Neispravna Monri sesija');
    // BE-07/P-B07-5: origin mora biti sa allowliste (CORS_ORIGINS + API URL) —
    // ranije je bilo koji `http…` string prolazio i potpisivao tuđi domen.
    if (!isAllowedPaymentOrigin(origin, this.paymentOrigins()))
      throw new BadRequestException('Origin nije validan');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Korisnik nije pronađen');
    const { amount, label, cancelPath } = await this.sessionAmount(
      ref,
      userId,
      sessionId,
    );
    const successPath = ref.kind === 'membership' ? '/clanstvo' : '/ulaznice';
    const kindQ = ref.kind === 'season' ? '&kind=season' : '';
    const successUrl = withMonriReturnUrl(
      `${origin}${successPath}?paid=1&provider=monri&session_id={CHECKOUT_SESSION_ID}${kindQ}`,
      sessionId,
    );
    const cancelUrl = `${origin}${cancelPath}?cancelled=1`;
    return this.buildForm(
      sessionId,
      amount,
      label,
      user,
      successUrl,
      cancelUrl,
    );
  }

  private async sessionAmount(
    ref: { kind: 'tickets' | 'membership' | 'season'; id: string },
    userId: string,
    sessionId: string,
  ) {
    if (ref.kind === 'tickets') {
      const order = await this.prisma.ticketOrder.findFirst({
        where: { id: ref.id, userId },
        include: { payment: true },
      });
      if (!order?.payment || order.payment.externalId !== sessionId) {
        throw new BadRequestException('Narudžba nije pronađena');
      }
      return {
        amount: Number(order.total),
        label: 'Ulaznice FK Gracanica',
        cancelPath: '/ulaznice',
      };
    }
    if (ref.kind === 'season') {
      const pass = await this.prisma.seasonPass.findFirst({
        where: { id: ref.id, userId },
      });
      if (!pass) throw new BadRequestException('Sezonska karta nije pronađena');
      return {
        amount: Number(pass.price),
        label: pass.label,
        cancelPath: '/ulaznice',
      };
    }
    const membership = await this.prisma.membership.findFirst({
      where: { id: ref.id, userId },
    });
    if (!membership) throw new BadRequestException('Članstvo nije pronađeno');
    return {
      // BE-07/P-B07-1: cijena sa servera (isti helper kao checkout).
      amount: await readMembershipAmount(this.prisma),
      label: 'Clanstvo FK Gracanica',
      cancelPath: '/clanstvo',
    };
  }

  private bridgeUrl(
    successUrl: string,
    orderNumber: string,
  ): CheckoutSessionResult {
    const origin = new URL(successUrl).origin;
    return {
      url: `${origin}/placanje/monri?sid=${encodeURIComponent(orderNumber)}`,
      sessionId: orderNumber,
      provider: 'monri',
    };
  }

  private paymentOrigins(): string[] {
    return allowedOrigins(
      this.config.get<string>('corsOrigins'),
      this.config.get<string>('apiPublicUrl'),
    );
  }

  private async buildForm(
    orderNumber: string,
    amount: number,
    label: string,
    user: MonriUser,
    successUrl: string,
    cancelUrl: string,
  ): Promise<MonriFormPayload> {
    const cfg = await this.cfg();
    const amountMinor = toMinorUnits(amount);
    const currency = 'BAM';
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(' ').slice(0, 30) ||
      'Clan FK';
    const fields: Record<string, string> = {
      authenticity_token: cfg.token,
      digest: monriFormDigest(cfg.key, orderNumber, amountMinor, currency),
      amount: amountMinor,
      currency,
      order_number: orderNumber,
      order_info: label.slice(0, 100),
      transaction_type: 'purchase',
      language: 'ba',
      ch_full_name: name.length >= 3 ? name : 'Clan FK',
      ch_email: user.email.slice(0, 100),
      ch_address: 'Stadion',
      ch_city: 'Gracanica',
      ch_zip: '75300',
      ch_country: 'BA',
      ch_phone: '000000000',
      success_url_override: successUrl,
      cancel_url_override: cancelUrl,
      callback_url_override: cfg.callback,
    };
    return { action: monriFormUrl(cfg.mode), fields };
  }

  private async cfg() {
    const keys = [
      'payments.monri.merchantKey',
      'payments.monri.authenticationKey',
      'payments.monri.mode',
    ];
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: keys } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const key = map['payments.monri.merchantKey']?.trim() ?? '';
    const token = map['payments.monri.authenticationKey']?.trim() ?? '';
    if (!key || !token)
      throw new BadRequestException('Monri nije konfigurisan');
    // BE-07/P-B07-5: BE-01/P2 konvencija — nema `process.env` u modulima.
    const publicApi = (this.config.get<string>('apiPublicUrl') ?? '').replace(
      /\/$/,
      '',
    );
    return {
      key,
      token,
      mode: map['payments.monri.mode']?.trim() || 'test',
      callback: `${publicApi}/api/v1/payments/webhooks/monri`,
    };
  }
}
