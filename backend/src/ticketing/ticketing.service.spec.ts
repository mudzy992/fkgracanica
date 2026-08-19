import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { TicketingService } from './ticketing.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsReadinessService } from '../payments/payments-readiness.service';
import { TicketingOrdersService } from './ticketing-orders.service';

describe('TicketingService.validateTicket', () => {
  const prismaMock = {
    ticket: { findUnique: jest.fn(), update: jest.fn() },
    seasonPass: { findUnique: jest.fn() },
    membershipCard: { findUnique: jest.fn() },
  };
  const service = new TicketingService(
    prismaMock as unknown as PrismaService,
    {} as PaymentsReadinessService,
    {} as TicketingOrdersService,
    {} as import('../jobs/jobs.module').JobsService,
  );
  const baseTicket = {
    id: 't1',
    qrCode: 'ticket_abc',
    status: TicketStatus.PAID_AT_BOX_OFFICE,
    match: { homeClub: {}, awayClub: {} },
  };

  beforeEach(() => jest.clearAllMocks());

  it('throws NotFound when QR unknown', async () => {
    prismaMock.ticket.findUnique.mockResolvedValue(null);
    prismaMock.seasonPass.findUnique.mockResolvedValue(null);
    prismaMock.membershipCard.findUnique.mockResolvedValue(null);
    await expect(service.validateTicket('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns membership card when QR is a member code', async () => {
    prismaMock.ticket.findUnique.mockResolvedValue(null);
    prismaMock.seasonPass.findUnique.mockResolvedValue(null);
    prismaMock.membershipCard.findUnique.mockResolvedValue({
      id: 'c1',
      membership: { status: 'ACTIVE', user: { firstName: 'Ana', lastName: 'H', email: 'a@t.com' } },
    });
    const result = await service.validateTicket('member-1_abc');
    expect(result).toMatchObject({ kind: 'membership', status: 'ACTIVE', name: 'Ana H' });
  });

  it('rejects RESERVED (unpaid)', async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({ ...baseTicket, status: TicketStatus.RESERVED });
    await expect(service.validateTicket('ticket_abc')).rejects.toThrow(BadRequestException);
    expect(prismaMock.ticket.update).not.toHaveBeenCalled();
  });

  it('marks PAID_AT_BOX_OFFICE as USED', async () => {
    prismaMock.ticket.findUnique.mockResolvedValue(baseTicket);
    prismaMock.ticket.update.mockResolvedValue({ ...baseTicket, status: TicketStatus.USED });

    const result = await service.validateTicket('ticket_abc');

    expect(prismaMock.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: TicketStatus.USED } }),
    );
    expect(result.status).toBe(TicketStatus.USED);
  });

  it('inspect does not mark ticket USED', async () => {
    prismaMock.ticket.findUnique.mockResolvedValue(baseTicket);
    const result = await service.inspectTicket('ticket_abc');
    expect(prismaMock.ticket.update).not.toHaveBeenCalled();
    expect(result).toMatchObject({ kind: 'ticket', status: TicketStatus.PAID_AT_BOX_OFFICE });
  });

  it('rejects already USED', async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({ ...baseTicket, status: TicketStatus.USED });
    await expect(service.validateTicket('ticket_abc')).rejects.toThrow(BadRequestException);
  });
});
