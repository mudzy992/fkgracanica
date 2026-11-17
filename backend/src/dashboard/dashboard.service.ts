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
    const safeCount = async (promise: Promise<number>) => {
      try {
        return await promise;
      } catch {
        return 0;
      }
    };
    const safeVisitors = async () => {
      try {
        return await this.analytics.getTotals(30);
      } catch {
        return { web: 0, mobile: 0, total: 0 };
      }
    };

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
      safeCount(this.prisma.user.count({ where: { deletedAt: null } })),
      safeCount(
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
      ),
      safeCount(
        this.prisma.membership.count({
          where: { status: MembershipStatus.ACTIVE },
        }),
      ),
      safeCount(
        this.prisma.news.count({ where: { status: ContentStatus.PUBLISHED } }),
      ),
      safeCount(this.prisma.match.count()),
      safeCount(
        this.prisma.matchEvent.count({
          where: { type: { in: ['GOAL', 'PENALTY_SCORED'] } },
        }),
      ),
      safeCount(
        this.prisma.ticket.count({ where: { status: { not: 'CANCELLED' } } }),
      ),
      safeCount(
        this.prisma.news.count({ where: { status: ContentStatus.PENDING } }),
      ),
      safeCount(
        this.prisma.gallery.count({ where: { status: ContentStatus.PENDING } }),
      ),
      safeCount(
        this.prisma.match.count({
          where: { reportStatus: MatchReportStatus.PENDING_APPROVAL },
        }),
      ),
      safeCount(
        this.prisma.membership.count({
          where: { status: MembershipStatus.PENDING },
        }),
      ),
      safeCount(
        this.prisma.contactMessage.count({ where: { isRead: false } }),
      ),
      safeVisitors(),
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
