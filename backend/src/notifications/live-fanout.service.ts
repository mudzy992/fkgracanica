import { Injectable } from '@nestjs/common';
import { MatchEventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import {
  buildLivePushMessage,
  type LivePushEvent,
} from './live-push-message.util';

@Injectable()
export class LiveFanoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async fanout(
    matchId: string,
    event: LivePushEvent & { type: MatchEventType },
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { homeClub: true, awayClub: true },
    });
    if (!match) return;

    const msg = buildLivePushMessage(match, event);
    if (!msg) return;

    const users = await this.prisma.user.findMany({
      where: { deletedAt: null, isActive: true, pushDevices: { some: {} } },
      select: { id: true },
    });
    await Promise.all(
      users.map((user) =>
        this.notifications.createLive(user.id, {
          title: msg.title,
          body: msg.body,
          path: `/live/${matchId}`,
          type: event.type,
        }),
      ),
    );
  }
}
