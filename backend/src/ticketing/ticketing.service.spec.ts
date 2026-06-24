import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { TicketingService } from './ticketing.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TicketingService.validateTicket', () => {
  const prismaMock = {
    ticket: { findUnique: jest.fn(), update: jest.fn() },
  };
  const service = new TicketingService(prismaMock as unknown as PrismaService);
  const baseTicket = {
    id: 't1',
    qrCode: 'ticket_abc',
    status: TicketStatus.PAID_AT_BOX_OFFICE,
    match: { homeClub: {}, awayClub: {} },
  };

  beforeEach(() => jest.clearAllMocks());

  it('throws NotFound when QR unknown', async () => {
    prismaMock.ticket.findUnique.mockResolvedValue(null);
    await expect(service.validateTicket('missing')).rejects.toThrow(NotFoundException);
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

  it('rejects already USED', async () => {
    prismaMock.ticket.findUnique.mockResolvedValue({ ...baseTicket, status: TicketStatus.USED });
    await expect(service.validateTicket('ticket_abc')).rejects.toThrow(BadRequestException);
  });
});
