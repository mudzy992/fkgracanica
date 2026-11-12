import { BadRequestException } from '@nestjs/common';
import { PaymentStatus, TicketStatus } from '@prisma/client';
import { TicketingOrdersService } from './ticketing-orders.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { TicketingConfigService } from './ticketing-config.service';
import type { PaymentsReadinessService } from '../payments/payments-readiness.service';

type Mocks = {
  ticketOrder: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  ticket: { updateMany: jest.Mock };
  payment: { findUnique: jest.Mock; update: jest.Mock };
  $transaction: jest.Mock;
};

function makeService() {
  const prisma: Mocks = {
    ticketOrder: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 'o1' }),
    },
    ticket: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    payment: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 'p1' }),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const service = new TicketingOrdersService(
    prisma as unknown as PrismaService,
    {} as TicketingConfigService,
    {} as PaymentsReadinessService,
  );
  return { service, prisma };
}

const pendingOrder = {
  id: 'o1',
  status: 'pending',
  tickets: [{ id: 't1', status: TicketStatus.RESERVED }],
  payment: { id: 'p1', status: PaymentStatus.PENDING_BOX_OFFICE },
};
const paidOrder = {
  id: 'o1',
  status: 'paid',
  tickets: [{ id: 't1', status: TicketStatus.PAID_AT_BOX_OFFICE }],
  payment: { id: 'p1', status: PaymentStatus.CONFIRMED },
};

describe('TicketingOrdersService.cancelOrder (BE-07 / P-B07-6)', () => {
  it('cancels an unpaid order and its payment', async () => {
    const { service, prisma } = makeService();
    prisma.ticketOrder.findFirst.mockResolvedValue(pendingOrder);

    await service.cancelOrder('o1', 'u1');

    expect(prisma.ticket.updateMany).toHaveBeenCalledWith({
      where: { orderId: 'o1' },
      data: { status: TicketStatus.CANCELLED },
    });
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { status: PaymentStatus.CANCELLED },
    });
    expect(prisma.ticketOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'cancelled' } }),
    );
  });

  it('refuses to cancel a paid order (goes through refund)', async () => {
    const { service, prisma } = makeService();
    prisma.ticketOrder.findFirst.mockResolvedValue(paidOrder);

    await expect(service.cancelOrder('o1', 'u1')).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });
});

describe('TicketingOrdersService.requestRefund (BE-07 / P-B07-6)', () => {
  it('refuses a refund for an unpaid order (was allowed before)', async () => {
    const { service, prisma } = makeService();
    prisma.ticketOrder.findFirst.mockResolvedValue(pendingOrder);

    await expect(service.requestRefund('o1', 'u1')).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });

  it('refuses a refund when a ticket was already used', async () => {
    const { service, prisma } = makeService();
    prisma.ticketOrder.findFirst.mockResolvedValue({
      ...paidOrder,
      tickets: [{ id: 't1', status: TicketStatus.USED }],
    });

    await expect(service.requestRefund('o1', 'u1')).rejects.toThrow(
      /iskorištene/,
    );
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });

  it('marks tickets REFUND_REQUESTED for a paid order', async () => {
    const { service, prisma } = makeService();
    prisma.ticketOrder.findFirst.mockResolvedValue(paidOrder);

    await service.requestRefund('o1', 'u1');

    expect(prisma.ticket.updateMany).toHaveBeenCalledWith({
      where: { orderId: 'o1' },
      data: { status: TicketStatus.REFUND_REQUESTED },
    });
    expect(prisma.ticketOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'refund_requested' } }),
    );
  });
});

describe('TicketingOrdersService admin refund/cancel (BE-07 / P-B07-6)', () => {
  it('admin cannot cancel a paid order', async () => {
    const { service, prisma } = makeService();
    prisma.ticketOrder.findUnique.mockResolvedValue(paidOrder);

    await expect(service.adminCancelOrder('o1')).rejects.toThrow(/povrat/);
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });

  it('confirmRefund cancels tickets and refunds the payment', async () => {
    const { service, prisma } = makeService();
    prisma.ticketOrder.findUnique.mockResolvedValue({
      ...paidOrder,
      status: 'refund_requested',
    });

    await service.confirmRefund('o1');

    expect(prisma.ticket.updateMany).toHaveBeenCalledWith({
      where: { orderId: 'o1' },
      data: { status: TicketStatus.CANCELLED },
    });
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { status: PaymentStatus.REFUNDED },
    });
  });
});
