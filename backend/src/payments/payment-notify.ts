import type { PrismaService } from '../prisma/prisma.service';
import type { JobsService } from '../jobs/jobs.module';
import type { NotificationsService } from '../notifications/notifications.service';
import {
  membershipConfirmEmail,
  seasonPassConfirmEmail,
  ticketConfirmEmail,
} from '../jobs/email-templates';

export async function notifyTicketPaid(
  prisma: PrismaService,
  jobs: JobsService,
  orderId: string,
  notifications?: NotificationsService,
) {
  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, email: true, firstName: true } },
      tickets: { include: { match: { include: { homeClub: true, awayClub: true } } } },
    },
  });
  if (!order?.user?.email) return;
  const match = order.tickets[0]?.match;
  const label = match ? `${match.homeClub.name} – ${match.awayClub.name}` : 'Utakmica';
  const mail = ticketConfirmEmail(`${label}, ${order.tickets.length} ulaznica.`);
  await jobs.enqueueEmail({
    to: order.user.email,
    subject: mail.subject,
    body: mail.text,
    html: mail.html,
  });
  if (notifications) {
    await notifications.create({
      userId: order.user.id,
      title: '🎟 Ulaznice potvrđene',
      body: `Vaše ${order.tickets.length} ulaznice za ${label} su rezervisane`,
      type: 'ticket.paid',
      metadata: { path: '/tickets' },
    });
  }
}

export async function notifyMembershipActive(
  prisma: PrismaService,
  jobs: JobsService,
  membershipId: string,
  notifications?: NotificationsService,
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
  });
  if (!membership?.user?.email) return;
  const name =
    [membership.user.firstName, membership.user.lastName].filter(Boolean).join(' ') || 'člane';
  const mail = membershipConfirmEmail(name);
  await jobs.enqueueEmail({
    to: membership.user.email,
    subject: mail.subject,
    body: mail.text,
    html: mail.html,
  });
  if (notifications) {
    await notifications.create({
      userId: membership.user.id,
      title: '🎉 Članstvo aktivirano',
      body: 'Vaše članstvo u FK Gračanica je sada aktivno',
      type: 'membership.active',
      metadata: { path: '/membership' },
    });
  }
}

export async function notifySeasonPassActive(
  prisma: PrismaService,
  jobs: JobsService,
  passId: string,
  notifications?: NotificationsService,
) {
  const pass = await prisma.seasonPass.findUnique({
    where: { id: passId },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!pass?.user?.email) return;
  const mail = seasonPassConfirmEmail(pass.label);
  await jobs.enqueueEmail({
    to: pass.user.email,
    subject: mail.subject,
    body: mail.text,
    html: mail.html,
  });
  if (notifications) {
    await notifications.create({
      userId: pass.user.id,
      title: '🏟 Sezonska karta aktivna',
      body: `${pass.label} — pokažite QR kod na ulazu`,
      type: 'season_pass.active',
      metadata: { path: '/tickets' },
    });
  }
}
