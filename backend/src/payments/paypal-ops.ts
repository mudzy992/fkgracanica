import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.module';
import { confirmMembershipFlow, confirmTicketOrderFlow } from './stripe-confirm.flow';
import { confirmSeasonPassFlow } from '../ticketing/season-pass-confirm.util';
import { notifyMembershipActive, notifySeasonPassActive, notifyTicketPaid } from './payment-notify';
import { paypalBaseUrl, parsePaypalCustomId } from './paypal-api.util';
import {
  paypalAccessToken,
  paypalCaptureOrder,
  paypalGetOrder,
  paypalVerifyWebhook,
} from './paypal-http.util';
import {
  extractPaypalCustomId,
  extractPaypalOrderId,
  paypalWebhookShouldCapture,
  paypalWebhookShouldConfirm,
  type PaypalWebhookEvent,
} from './paypal-webhook.util';

export type PaypalCtx = {
  baseUrl: string;
  token: string;
  currency: string;
  webhookId: string;
};

@Injectable()
export class PaypalOps {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
  ) {}

  async ctx(): Promise<PaypalCtx> {
    const keys = [
      'payments.paypal.clientId',
      'payments.paypal.clientSecret',
      'payments.paypal.mode',
      'payments.paypal.currency',
      'payments.paypal.webhookId',
    ];
    const rows = await this.prisma.setting.findMany({ where: { key: { in: keys } } });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const clientId = map['payments.paypal.clientId']?.trim() ?? '';
    const secret = map['payments.paypal.clientSecret']?.trim() ?? '';
    if (!clientId || !secret) throw new BadRequestException('PayPal nije konfigurisan');
    const mode = map['payments.paypal.mode']?.trim() || 'sandbox';
    const currency = (map['payments.paypal.currency']?.trim() || 'EUR').toUpperCase();
    const webhookId = map['payments.paypal.webhookId']?.trim() ?? '';
    const baseUrl = paypalBaseUrl(mode);
    const token = await paypalAccessToken(baseUrl, clientId, secret);
    return { baseUrl, token, currency, webhookId };
  }

  async confirmTicket(sessionId: string, userId: string) {
    const order = await this.ensureCompleted(sessionId);
    const meta = parsePaypalCustomId(order.purchase_units?.[0]?.custom_id);
    if (meta?.kind !== 'tickets') throw new BadRequestException('Neispravna PayPal sesija');
    const row = await this.prisma.ticketOrder.findFirst({
      where: { id: meta.id, userId },
    });
    if (!row) throw new BadRequestException('Narudžba nije pronađena');
    const fresh = await confirmTicketOrderFlow(this.prisma, meta.id);
    if (fresh) await notifyTicketPaid(this.prisma, this.jobs, meta.id);
    return { orderId: meta.id, status: 'paid' as const };
  }

  async confirmMembership(sessionId: string, userId: string) {
    const order = await this.ensureCompleted(sessionId);
    const meta = parsePaypalCustomId(order.purchase_units?.[0]?.custom_id);
    if (meta?.kind !== 'membership') throw new BadRequestException('Neispravna PayPal sesija');
    const membership = await this.prisma.membership.findFirst({
      where: { id: meta.id, userId },
    });
    if (!membership) throw new BadRequestException('Članstvo nije pronađeno');
    const fresh = await confirmMembershipFlow(this.prisma, meta.id);
    if (fresh) await notifyMembershipActive(this.prisma, this.jobs, meta.id);
    return { membershipId: meta.id, status: 'ACTIVE' as const };
  }

  async confirmSeasonPass(sessionId: string, userId: string) {
    const order = await this.ensureCompleted(sessionId);
    const meta = parsePaypalCustomId(order.purchase_units?.[0]?.custom_id);
    if (meta?.kind !== 'season') throw new BadRequestException('Neispravna PayPal sesija');
    const pass = await this.prisma.seasonPass.findFirst({
      where: { id: meta.id, userId },
    });
    if (!pass) throw new BadRequestException('Sezonska karta nije pronađena');
    const fresh = await confirmSeasonPassFlow(this.prisma, meta.id, {
      paymentProvider: 'paypal',
      externalId: sessionId,
    });
    if (fresh) await notifySeasonPassActive(this.prisma, this.jobs, meta.id);
    return { passId: meta.id, status: 'ACTIVE' as const };
  }

  async handleWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>) {
    const event = JSON.parse(rawBody.toString('utf8')) as PaypalWebhookEvent;
    await this.verifyWebhook(rawBody, headers);
    if (!paypalWebhookShouldConfirm(event.event_type)) return { received: true };
    const orderId = extractPaypalOrderId(event);
    if (!orderId) return { received: true };
    if (paypalWebhookShouldCapture(event.event_type)) await this.captureIgnoreDup(orderId);
    const ctx = await this.ctx();
    let meta = extractPaypalCustomId(event);
    if (!meta) {
      const order = await paypalGetOrder(ctx.baseUrl, ctx.token, orderId);
      meta = parsePaypalCustomId(order.purchase_units?.[0]?.custom_id);
    }
    if (meta?.kind === 'tickets') {
      const fresh = await confirmTicketOrderFlow(this.prisma, meta.id);
      if (fresh) await notifyTicketPaid(this.prisma, this.jobs, meta.id);
    }
    if (meta?.kind === 'membership') {
      const fresh = await confirmMembershipFlow(this.prisma, meta.id);
      if (fresh) await notifyMembershipActive(this.prisma, this.jobs, meta.id);
    }
    if (meta?.kind === 'season') {
      const fresh = await confirmSeasonPassFlow(this.prisma, meta.id, {
        paymentProvider: 'paypal',
        externalId: orderId,
      });
      if (fresh) await notifySeasonPassActive(this.prisma, this.jobs, meta.id);
    }
    return { received: true };
  }

  private async ensureCompleted(orderId: string) {
    const ctx = await this.ctx();
    let order = await paypalGetOrder(ctx.baseUrl, ctx.token, orderId);
    if (order.status === 'APPROVED') {
      await this.captureIgnoreDup(orderId);
      order = await paypalGetOrder(ctx.baseUrl, ctx.token, orderId);
    }
    if (order.status !== 'COMPLETED') {
      throw new BadRequestException('PayPal plaćanje nije završeno');
    }
    return order;
  }

  private async captureIgnoreDup(orderId: string) {
    const ctx = await this.ctx();
    try {
      await paypalCaptureOrder(ctx.baseUrl, ctx.token, orderId);
    } catch {
      /* already captured */
    }
  }

  private async verifyWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ) {
    const ctx = await this.ctx();
    if (!ctx.webhookId) throw new BadRequestException('PayPal webhook ID nije postavljen');
    const header = (key: string) => {
      const v = headers[key];
      return Array.isArray(v) ? v[0] : v ?? '';
    };
    const ok = await paypalVerifyWebhook(ctx.baseUrl, ctx.token, {
      transmission_id: header('paypal-transmission-id'),
      transmission_time: header('paypal-transmission-time'),
      cert_url: header('paypal-cert-url'),
      auth_algo: header('paypal-auth-algo'),
      transmission_sig: header('paypal-transmission-sig'),
      webhook_id: ctx.webhookId,
      webhook_event: JSON.parse(rawBody.toString('utf8')),
    });
    if (!ok) throw new BadRequestException('PayPal webhook potpis nije validan');
  }
}
