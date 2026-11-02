jest.mock('@prisma/client', () => {
  const makeSentinel = (): unknown => {
    const target: Record<string, unknown> = {};
    return new Proxy(target, {
      get: (t, prop) => {
        if (prop === 'PrismaClient') return class PrismaClientMock {};
        if (prop === 'then') return undefined;
        if (prop === 'toString') return () => '[prisma-mock]';
        if (prop === Symbol.toPrimitive) return () => '[prisma-mock]';
        if (typeof prop === 'symbol') return Reflect.get(t, prop) as unknown;
        if (!(prop in t)) t[prop] = makeSentinel();
        return t[prop];
      },
      has: () => true,
    });
  };
  return makeSentinel();
});
import { Test } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationDeliveryService } from './notification-delivery.service';

/**
 * BE-03: unit testovi NotificationsService — OWNERSHIP invarijante:
 * svaka operacija mora nositi userId vlasnika u where klauzuli
 * (id×userId, userId×token) — niko ne može dirati tuđe notifikacije/uređaje.
 */
describe('NotificationsService (BE-03)', () => {
  let service: NotificationsService;
  const prismaMock = {
    notification: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    pushDevice: { upsert: jest.fn(), deleteMany: jest.fn() },
  };
  const realtimeMock = { emitNotificationNew: jest.fn() };
  const deliveryMock = { deliver: jest.fn(), deliverPushOnly: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.notification.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.pushDevice.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.pushDevice.upsert.mockResolvedValue({});
    const module = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RealtimeGateway, useValue: realtimeMock },
        { provide: NotificationDeliveryService, useValue: deliveryMock },
      ],
    }).compile();
    service = module.get(NotificationsService);
  });

  it('markRead: where MORA sadržavati id I userId vlasnika (ownership)', async () => {
    await service.markRead('notif-1', 'owner-1');

    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'notif-1', userId: 'owner-1' },
      data: { isRead: true },
    });
  });

  it('markAllRead: granica je isključivo userId vlasnika', async () => {
    await service.markAllRead('owner-2');

    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'owner-2', isRead: false },
      data: { isRead: true },
    });
  });

  it('unregisterDevice: briše SAMO token vlasnika (userId + expoPushToken)', async () => {
    await service.unregisterDevice('owner-3', 'ExpoPushToken[abc]');

    expect(prismaMock.pushDevice.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'owner-3', expoPushToken: 'ExpoPushToken[abc]' },
    });
  });

  it('registerDevice: upsert veže token na pozivaoca (i create i update grana)', async () => {
    await service.registerDevice('owner-4', 'tok-4', 'android');

    expect(prismaMock.pushDevice.upsert).toHaveBeenCalledWith({
      where: { expoPushToken: 'tok-4' },
      update: { userId: 'owner-4', platform: 'android' },
      create: {
        userId: 'owner-4',
        expoPushToken: 'tok-4',
        platform: 'android',
      },
    });
  });
});
