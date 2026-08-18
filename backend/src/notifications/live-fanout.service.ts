import { Injectable } from '@nestjs/common';
import { MatchEventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

const TYPE_LABEL: Record<string, string> = {
  GOAL: 'Gol',
  OWN_GOAL: 'Autogol',
  YELLOW_CARD: 'Žuti karton',
  RED_CARD: 'Crveni karton',
  SECOND_YELLOW: 'Drugi žuti',
  PENALTY_SCORED: 'Penal',
  PENALTY_MISSED: 'Promašen penal',
  SUBSTITUTION: 'Izmjena',
  KICKOFF: 'Početak',
  HALFTIME: 'Poluvrijeme',
  SECOND_HALF: 'Drugo poluvrijeme',
  FULL_TIME: 'Kraj',
  EXTRA_TIME: 'Produžeci',
  CORNER: 'Korner',
  FOUL: 'Prekršaj',
  SHOT: 'Udarac',
  SHOT_ON_TARGET: 'Udarac u okvir',
  FREE_KICK: 'Slobodan udarac',
  OFFSIDE: 'Zaleđe',
  INJURY: 'Povreda',
  VAR: 'VAR',
  COMMENT: 'Komentar',
};

@Injectable()
export class LiveFanoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async fanout(matchId: string, type: MatchEventType, description?: string | null) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { homeClub: true, awayClub: true },
    });
    if (!match) return;
    const title = `${match.homeClub.name} ${match.homeScore}:${match.awayScore} ${match.awayClub.name}`;
    const body = [TYPE_LABEL[type] ?? type, description].filter(Boolean).join(' — ');
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null, isActive: true, pushDevices: { some: {} } },
      select: { id: true },
    });
    await Promise.all(
      users.map((user) =>
        this.notifications.createLive(user.id, {
          title,
          body,
          path: `/live/${matchId}`,
          type,
        }),
      ),
    );
  }
}
