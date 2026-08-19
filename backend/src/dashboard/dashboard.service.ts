import { Injectable } from '@nestjs/common';
import { ContentStatus, MatchReportStatus, MembershipStatus } from '@prisma/client';
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
      this.prisma.news.count({ where: { status: ContentStatus.PENDING } }),
      this.prisma.gallery.count({ where: { status: ContentStatus.PENDING } }),
      this.prisma.match.count({ where: { reportStatus: MatchReportStatus.PENDING_APPROVAL } }),
      this.prisma.membership.count({ where: { status: MembershipStatus.PENDING } }),
      this.prisma.contactMessage.count({ where: { isRead: false } }),
      this.analytics.getTotals(30),
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
