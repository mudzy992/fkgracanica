import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PaginatedQueryDto } from '../common/dto/paginated-query.dto';
import { paginate, parsePagination } from '../common/utils/pagination.util';

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
    this.realtime.emitNotificationNew(input.userId, notification);
    return notification;
  }
}
