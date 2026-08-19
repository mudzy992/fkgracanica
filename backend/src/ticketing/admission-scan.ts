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
      if (err instanceof NotFoundException && err.message === 'Ulaznica nije pronađena') {
        return validateMembershipCard(prisma, qrCode);
      }
      throw err;
    }
  }
  assertPaidTicket(ticket.status);
  if (!commit) return { kind: 'ticket' as const, ...ticket };
  const row = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: TicketStatus.USED },
    include: TICKET_SCAN_INCLUDE,
  });
  return { kind: 'ticket' as const, ...row };
}
