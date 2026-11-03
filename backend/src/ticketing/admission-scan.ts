import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { validateMembershipCard } from './membership-validate.util';
import { validateSeasonPass } from './season-pass-validate.util';

const TICKET_SCAN_INCLUDE = {
  match: { include: { homeClub: true, awayClub: true } },
} as const;

export function assertPaidTicket(status: TicketStatus): void {
  if (status === TicketStatus.USED) {
    throw new BadRequestException('Ulaznica je već iskorištena');
  }
  if (status === TicketStatus.CANCELLED) {
    throw new BadRequestException('Ulaznica je otkazana');
  }
  if (status === TicketStatus.RESERVED) {
    throw new BadRequestException('Ulaznica nije plaćena');
  }
  if (status !== TicketStatus.PAID_AT_BOX_OFFICE) {
    throw new BadRequestException('Ulaznica nije validna');
  }
}

export async function scanAdmission(
  prisma: PrismaService,
  qrCode: string,
  matchId: string | undefined,
  commit: boolean,
) {
  const ticket = await prisma.ticket.findUnique({
    where: { qrCode },
    include: TICKET_SCAN_INCLUDE,
  });
  if (!ticket) {
    try {
      return await validateSeasonPass(prisma, qrCode, matchId, { commit });
    } catch (err) {
      if (
        err instanceof NotFoundException &&
        err.message === 'Ulaznica nije pronađena'
      ) {
        return validateMembershipCard(prisma, qrCode);
      }
      throw err;
    }
  }
  assertPaidTicket(ticket.status);
  if (!commit) return { kind: 'ticket' as const, ...ticket };
  // BE-07/P-B07-7: atomski „claim“ (check-then-update je puštao istu ulaznicu
  // dva puta kroz dva skenera). `updateMany` sa uslovom statusa: tačno jedan
  // skener dobije `count === 1`.
  const claimed = await prisma.ticket.updateMany({
    where: { id: ticket.id, status: TicketStatus.PAID_AT_BOX_OFFICE },
    data: { status: TicketStatus.USED },
  });
  if (claimed.count !== 1) {
    const fresh = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: TICKET_SCAN_INCLUDE,
    });
    if (fresh) assertPaidTicket(fresh.status);
    throw new NotFoundException('Ulaznica nije pronađena');
  }
  const row = await prisma.ticket.findUnique({
    where: { id: ticket.id },
    include: TICKET_SCAN_INCLUDE,
  });
  if (!row) throw new NotFoundException('Ulaznica nije pronađena');
  return { kind: 'ticket' as const, ...row };
}
