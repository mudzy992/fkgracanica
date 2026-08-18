import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { computeLiveClock } from './live-clock.util';

export async function emitLiveClock(
  prisma: PrismaService,
  realtime: RealtimeGateway,
  matchId: string,
): Promise<void> {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;
  const clock = computeLiveClock(match);
  if (clock) realtime.emitMatchClock(matchId, clock);
}
