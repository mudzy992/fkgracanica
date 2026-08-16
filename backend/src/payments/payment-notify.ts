import type { PrismaService } from '../prisma/prisma.service';
import type { JobsService } from '../jobs/jobs.module';
import {
  membershipConfirmEmail,
  ticketConfirmEmail,
} from '../jobs/email-templates';

export async function notifyTicketPaid(
  prisma: PrismaService,
  jobs: JobsService,
  orderId: string,
) {
  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, firstName: true } },
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
}

export async function notifyMembershipActive(
  prisma: PrismaService,
  jobs: JobsService,
  membershipId: string,
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!membership?.user?.email) return;
  const name = [membership.user.firstName, membership.user.lastName].filter(Boolean).join(' ') || 'člane';
  const mail = membershipConfirmEmail(name);
  await jobs.enqueueEmail({
    to: membership.user.email,
    subject: mail.subject,
    body: mail.text,
    html: mail.html,
  });
}
