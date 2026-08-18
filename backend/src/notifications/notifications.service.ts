import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PaginatedQueryDto } from '../common/dto/paginated-query.dto';
import { paginate, parsePagination } from '../common/utils/pagination.util';
import { NotificationDeliveryService } from './notification-delivery.service';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  type?: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly delivery: NotificationDeliveryService,
  ) {}

  async findForUser(userId: string, query: PaginatedQueryDto, unreadOnly = false) {
    const params = parsePagination(query);
    const where = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };
    return paginate(
      params,
      (skip, take) =>
        this.prisma.notification.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
      () => this.prisma.notification.count({ where }),
    );
  }

  async markRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { ok: true };
  }

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({ data: input });
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        email: true,
        notifyInApp: true,
        notifyEmail: true,
        notifyPush: true,
        pushDevices: { select: { expoPushToken: true } },
      },
    });
    if (user?.notifyInApp !== false) {
      this.realtime.emitNotificationNew(input.userId, notification);
    }
    const metadata = input.metadata as Record<string, unknown> | undefined;
    if (user) {
      await this.delivery.deliver(user, {
        title: notification.title,
        body: notification.body,
        type: notification.type,
        path: typeof metadata?.path === 'string' ? metadata.path : undefined,
      });
    }
    return notification;
  }

  async createLive(
    userId: string,
    input: { title: string; body: string; path: string; type: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        notifyInApp: true,
        notifyPush: true,
        notifyLiveMatch: true,
        email: true,
        pushDevices: { select: { expoPushToken: true } },
      },
    });
    if (!user) return null;
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title: input.title,
        body: input.body,
        type: `live.${input.type}`,
        metadata: { path: input.path },
      },
    });
    if (user.notifyInApp !== false) {
      this.realtime.emitNotificationNew(userId, notification);
    }
    if (user.notifyPush && user.notifyLiveMatch) {
      await this.delivery.deliverPushOnly(
        { notifyPush: true, pushDevices: user.pushDevices },
        { title: notification.title, body: notification.body, type: notification.type, path: input.path },
      );
    }
    return notification;
  }

  async registerDevice(userId: string, token: string, platform?: string) {
    return this.prisma.pushDevice.upsert({
      where: { expoPushToken: token },
      update: { userId, platform },
      create: { userId, expoPushToken: token, platform },
    });
  }

  async unregisterDevice(userId: string, token: string) {
    await this.prisma.pushDevice.deleteMany({
      where: { userId, expoPushToken: token },
    });
    return { ok: true };
  }
}
