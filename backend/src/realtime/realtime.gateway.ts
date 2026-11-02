import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket, DefaultEventsMap } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

type SocketData = { public?: boolean; userId?: string };
type ClientSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/realtime',
  path: process.env.SOCKET_IO_PATH || '/socket.io',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: ClientSocket) {
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.headers.authorization?.replace('Bearer ', '') ?? '');

    if (!token) {
      client.data.public = true;
      this.logger.debug('Public client connected');
      return;
    }

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, isActive: true, deletedAt: null },
      });
      if (!user) {
        client.disconnect();
        return;
      }
      client.data.userId = user.id;
      client.join(`user:${user.id}`);
      this.logger.debug(`Client connected: ${user.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: ClientSocket) {
    this.logger.debug(`Client disconnected: ${client.data.userId ?? 'public'}`);
  }

  @SubscribeMessage('match:join')
  handleMatchJoin(
    @ConnectedSocket()
    client: ClientSocket,
    @MessageBody() body: { matchId?: string },
  ) {
    if (!body?.matchId) return { ok: false };
    client.join(`match:${body.matchId}`);
    return { ok: true, matchId: body.matchId };
  }

  @SubscribeMessage('match:leave')
  handleMatchLeave(
    @ConnectedSocket()
    client: ClientSocket,
    @MessageBody() body: { matchId?: string },
  ) {
    if (body?.matchId) client.leave(`match:${body.matchId}`);
    return { ok: true };
  }

  @SubscribeMessage('newsletter:join')
  handleNewsletterJoin(
    @ConnectedSocket()
    client: ClientSocket,
  ) {
    if (!client.data.userId) return { ok: false };
    client.join('newsletter');
    return { ok: true };
  }

  @SubscribeMessage('newsletter:leave')
  handleNewsletterLeave(
    @ConnectedSocket()
    client: ClientSocket,
  ) {
    client.leave('newsletter');
    return { ok: true };
  }

  emitNewsletterCampaign(payload: {
    id: string;
    status: string;
    sentCount: number;
    failCount: number;
    targetCount: number;
  }) {
    if (!this.server) {
      this.logger.warn('Socket nije spreman — preskačem newsletter:campaign');
      return;
    }
    this.server.to('newsletter').emit('newsletter:campaign', payload);
  }

  emitSettingsChanged(scope: string, settings: Record<string, string>) {
    this.server.emit('settings:changed', { scope, settings });
  }

  private emitRoom(matchId: string, event: string, payload: unknown) {
    if (!this.server) {
      this.logger.warn(`Socket nije spreman — preskačem ${event}`);
      return;
    }
    this.server.to(`match:${matchId}`).emit(event, payload);
  }

  emitMatchEvent(matchId: string, event: unknown) {
    this.emitRoom(matchId, 'match:event', event);
  }

  emitLiveComment(matchId: string, comment: unknown) {
    this.emitRoom(matchId, 'match:comment', comment);
  }

  emitMatchStatus(matchId: string, status: unknown) {
    this.emitRoom(matchId, 'match:status', status);
  }

  emitMatchScore(
    matchId: string,
    score: {
      homeScore: number;
      awayScore: number;
      minute: number;
      penaltyHomeScore?: number;
      penaltyAwayScore?: number;
    },
  ) {
    this.emitRoom(matchId, 'match:score', { id: matchId, ...score });
  }

  emitMatchClock(matchId: string, clock: unknown) {
    this.emitRoom(matchId, 'match:clock', clock);
  }

  emitNotificationNew(userId: string, notification: unknown) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }
}
