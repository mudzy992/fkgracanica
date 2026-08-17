import { Injectable } from '@nestjs/common';
import { ContentStatus, MembershipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis() {
    const [
      users,
      members,
      activeMemberships,
      publishedNews,
      matches,
      goals,
      ticketsSold,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.membership.count({
        where: {
          status: {
            in: [
              MembershipStatus.ACTIVE,
              MembershipStatus.PENDING,
              MembershipStatus.SUSPENDED,
              MembershipStatus.EXPIRED,
            ],
          },
        },
      }),
      this.prisma.membership.count({ where: { status: MembershipStatus.ACTIVE } }),
      this.prisma.news.count({ where: { status: ContentStatus.PUBLISHED } }),
      this.prisma.match.count(),
      this.prisma.matchEvent.count({
        where: { type: { in: ['GOAL', 'PENALTY_SCORED'] } },
      }),
      this.prisma.ticket.count({ where: { status: { not: 'CANCELLED' } } }),
    ]);
    return {
      users,
      members,
      activeMemberships,
      publishedNews,
      matches,
      goals,
      ticketsSold,
    };
  }
}
