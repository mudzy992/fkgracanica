import { BadRequestException } from '@nestjs/common';
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
import type { PrismaService } from '../prisma/prisma.service';
import type { JobsService } from '../jobs/jobs.module';
import type { NotificationsService } from '../notifications/notifications.service';

type Meta = Record<string, string>;

export async function applyStripePaidMeta(
  prisma: PrismaService,
  jobs: JobsService,
  meta: Meta,
  sessionId?: string,
  notifications?: NotificationsService,
) {
  if (meta.type === 'tickets' && meta.orderId) {
    const fresh = await confirmTicketOrderFlow(prisma, meta.orderId);
    if (fresh)
      await notifyTicketPaid(prisma, jobs, meta.orderId, notifications);
  }
  if (meta.type === 'membership' && meta.membershipId) {
    const fresh = await confirmMembershipFlow(prisma, meta.membershipId);
    if (fresh)
      await notifyMembershipActive(
        prisma,
        jobs,
        meta.membershipId,
        notifications,
      );
  }
  if (meta.type === 'season_pass' && meta.passId) {
    const fresh = await confirmSeasonPassFlow(prisma, meta.passId, {
      paymentProvider: 'stripe',
      externalId: sessionId,
    });
    if (fresh)
      await notifySeasonPassActive(prisma, jobs, meta.passId, notifications);
  }
}

export async function confirmStripeSeasonPass(
  prisma: PrismaService,
  jobs: JobsService,
  session: { metadata: Meta | null; payment_status: string },
  userId: string,
  sessionId: string,
  notifications?: NotificationsService,
) {
  const meta = session.metadata ?? {};
  if (meta.type !== 'season_pass' || !meta.passId) {
    throw new BadRequestException('Neispravna sesija plaćanja');
  }
  const pass = await prisma.seasonPass.findFirst({
    where: { id: meta.passId, userId },
  });
  if (!pass) throw new BadRequestException('Sezonska karta nije pronađena');
  if (session.payment_status === 'paid') {
    await applyStripePaidMeta(prisma, jobs, meta, sessionId, notifications);
    return { passId: meta.passId, status: 'ACTIVE' as const };
  }
  return {
    passId: meta.passId,
    status: pass.status,
    paymentStatus: session.payment_status,
  };
}
