import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.module';
import { NotificationsService } from '../notifications/notifications.service';
import {
  confirmMembershipFlow,
  confirmTicketOrderFlow,
} from './stripe-confirm.flow';
import { confirmSeasonPassFlow } from '../ticketing/season-pass-confirm.util';
import {
  notifyMembershipActive,
  notifySeasonPassActive,
  notifyTicketPaid,
} from './payment-notify';
import { paymentEventKey, runPaymentEventOnce } from './payment-event.util';
import { confirmFromWebhook } from './webhook-confirm.util';
import {
  hexEqual,
  monriCallbackDigest,
  monriSuccessDigest,
  parseCallbackAuth,
  parseMonriRef,
  stripMonriDigest,
} from './monri-digest.util';

@Injectable()
export class MonriOps {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
    private readonly notifications: NotificationsService,
  ) {}

  async merchantKey() {
    const row = await this.prisma.setting.findUnique({
      where: { key: 'payments.monri.merchantKey' },
    });
    const key = row?.value?.trim() ?? '';
    if (!key) throw new BadRequestException('Monri nije konfigurisan');
    return key;
  }

  async confirmTicket(sessionId: string, userId: string, returnUrl?: string) {
    await this.assertApprovedReturn(returnUrl);
    const ref = parseMonriRef(sessionId);
    if (ref?.kind !== 'tickets')
      throw new BadRequestException('Neispravna Monri sesija');
    const order = await this.prisma.ticketOrder.findFirst({
      where: { id: ref.id, userId },
    });
    if (!order) throw new BadRequestException('Narudžba nije pronađena');
    const fresh = await runPaymentEventOnce(
      this.prisma,
      paymentEventKey('monri', sessionId, 'tickets', ref.id),
      () => confirmTicketOrderFlow(this.prisma, ref.id),
    );
    if (fresh)
      await notifyTicketPaid(
        this.prisma,
        this.jobs,
        ref.id,
        this.notifications,
      );
    return { orderId: ref.id, status: 'paid' as const };
  }

  async confirmMembership(
    sessionId: string,
    userId: string,
    returnUrl?: string,
  ) {
    await this.assertApprovedReturn(returnUrl);
    const ref = parseMonriRef(sessionId);
    if (ref?.kind !== 'membership')
      throw new BadRequestException('Neispravna Monri sesija');
    const membership = await this.prisma.membership.findFirst({
      where: { id: ref.id, userId },
    });
    if (!membership) throw new BadRequestException('Članstvo nije pronađeno');
    const fresh = await runPaymentEventOnce(
      this.prisma,
      paymentEventKey('monri', sessionId, 'membership', ref.id),
      () => confirmMembershipFlow(this.prisma, ref.id),
    );
    if (fresh)
      await notifyMembershipActive(
        this.prisma,
        this.jobs,
        ref.id,
        this.notifications,
      );
    return { membershipId: ref.id, status: 'ACTIVE' as const };
  }

  async confirmSeasonPass(
    sessionId: string,
    userId: string,
    returnUrl?: string,
  ) {
    await this.assertApprovedReturn(returnUrl);
    const ref = parseMonriRef(sessionId);
    if (ref?.kind !== 'season')
      throw new BadRequestException('Neispravna Monri sesija');
    const pass = await this.prisma.seasonPass.findFirst({
      where: { id: ref.id, userId },
    });
    if (!pass) throw new BadRequestException('Sezonska karta nije pronađena');
    const fresh = await runPaymentEventOnce(
      this.prisma,
      paymentEventKey('monri', sessionId, 'season_pass', ref.id),
      () =>
        confirmSeasonPassFlow(this.prisma, ref.id, {
          paymentProvider: 'monri',
          externalId: sessionId,
        }),
    );
    if (fresh)
      await notifySeasonPassActive(
        this.prisma,
        this.jobs,
        ref.id,
        this.notifications,
      );
    return { passId: ref.id, status: 'ACTIVE' as const };
  }

  async handleWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
  ) {
    const raw = rawBody.toString('utf8');
    const key = await this.merchantKey();
    const header = headers['authorization'] ?? headers['Authorization'];
    const given = parseCallbackAuth(Array.isArray(header) ? header[0] : header);
    if (!hexEqual(monriCallbackDigest(key, raw), given)) {
      throw new BadRequestException('Monri callback potpis nije validan');
    }
    const payload = JSON.parse(raw) as {
      status?: string;
      order_number?: string;
    };
    if (payload.status !== 'approved' || !payload.order_number)
      return { received: true };
    const ref = parseMonriRef(payload.order_number);
    if (ref) {
      await confirmFromWebhook(this.prisma, this.jobs, this.notifications, {
        provider: 'monri',
        externalId: payload.order_number,
        kind: ref.kind === 'season' ? 'season_pass' : ref.kind,
        refId: ref.id,
      });
    }
    return { received: true };
  }

  private async assertApprovedReturn(returnUrl?: string) {
    if (!returnUrl)
      throw new BadRequestException('Monri povratni URL nedostaje');
    const { url, digest } = stripMonriDigest(returnUrl);
    const key = await this.merchantKey();
    if (!digest || !hexEqual(monriSuccessDigest(key, url), digest)) {
      throw new BadRequestException('Monri digest nije validan');
    }
    const code = new URL(url).searchParams.get('response_code');
    if (code && code !== '0000')
      throw new BadRequestException('Monri plaćanje nije odobreno');
  }
}
