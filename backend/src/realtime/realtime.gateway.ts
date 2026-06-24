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
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

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

  async handleConnection(client: Socket) {
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

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.data.userId ?? 'public'}`);
  }

  @SubscribeMessage('match:join')
  handleMatchJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { matchId?: string },
  ) {
    if (!body?.matchId) return { ok: false };
    client.join(`match:${body.matchId}`);
    return { ok: true, matchId: body.matchId };
  }

  @SubscribeMessage('match:leave')
  handleMatchLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { matchId?: string },
  ) {
    if (body?.matchId) client.leave(`match:${body.matchId}`);
    return { ok: true };
  }

  emitSettingsChanged(scope: string, settings: Record<string, string>) {
    this.server.emit('settings:changed', { scope, settings });
  }

  emitMatchEvent(matchId: string, event: unknown) {
    this.server.to(`match:${matchId}`).emit('match:event', event);
  }

  emitLiveComment(matchId: string, comment: unknown) {
    this.server.to(`match:${matchId}`).emit('match:comment', comment);
  }

  emitMatchStatus(matchId: string, status: unknown) {
    this.server.to(`match:${matchId}`).emit('match:status', status);
  }

  emitMatchScore(
    matchId: string,
    score: { homeScore: number; awayScore: number; minute: number },
  ) {
    this.server.to(`match:${matchId}`).emit('match:score', score);
  }
}
