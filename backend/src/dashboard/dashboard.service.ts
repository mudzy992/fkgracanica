import { Injectable } from '@nestjs/common';
import {
  ContentStatus,
  MatchReportStatus,
  MembershipStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PublicAnalyticsService } from '../public-analytics/public-analytics.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: PublicAnalyticsService,
  ) {}

  async getKpis() {
    const [
      users,
      members,
      activeMemberships,
      publishedNews,
      matches,
      goals,
      ticketsSold,
      pendingNews,
      pendingGalleries,
      pendingLive,
      pendingMemberships,
      unreadInbox,
      visitors,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }).catch(() => 0),
      this.prisma.membership
        .count({
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
        })
        .catch(() => 0),
      this.prisma.membership
        .count({ where: { status: MembershipStatus.ACTIVE } })
        .catch(() => 0),
      this.prisma.news
        .count({ where: { status: ContentStatus.PUBLISHED } })
        .catch(() => 0),
      this.prisma.match.count().catch(() => 0),
      this.prisma.matchEvent
        .count({ where: { type: { in: ['GOAL', 'PENALTY_SCORED'] } } })
        .catch(() => 0),
      this.prisma.ticket
        .count({ where: { status: { not: 'CANCELLED' } } })
        .catch(() => 0),
      this.prisma.news
        .count({ where: { status: ContentStatus.PENDING } })
        .catch(() => 0),
      this.prisma.gallery
        .count({ where: { status: ContentStatus.PENDING } })
        .catch(() => 0),
      this.prisma.match
        .count({ where: { reportStatus: MatchReportStatus.PENDING_APPROVAL } })
        .catch(() => 0),
      this.prisma.membership
        .count({ where: { status: MembershipStatus.PENDING } })
        .catch(() => 0),
      this.prisma.contactMessage
        .count({ where: { isRead: false } })
        .catch(() => 0),
      this.analytics
        .getTotals(30)
        .catch(() => ({ web: 0, mobile: 0, total: 0 })),
    ]);
    return {
      users,
      members,
      activeMemberships,
      publishedNews,
      matches,
      goals,
      ticketsSold,
      pendingNews,
      pendingGalleries,
      pendingLive,
      pendingMemberships,
      unreadInbox,
      uniqueVisitorsWeb: visitors.web,
      uniqueVisitorsMobile: visitors.mobile,
      uniqueVisitorsTotal30d: visitors.total,
    };
  }
}
