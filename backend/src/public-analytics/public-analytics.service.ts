import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { resolveVisitGeo } from './visit-geo.util';
import { isVisitRateLimited } from './visit-rate-limit.util';

@Injectable()
export class PublicAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordVisit(
    platform: 'web' | 'mobile',
    visitorId: string,
    ip?: string,
  ): Promise<void> {
    const hash = createHash('sha256').update(visitorId).digest('hex');
    if (isVisitRateLimited(platform, hash)) return;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const geo = resolveVisitGeo(ip);

    await this.prisma.visitorVisit.upsert({
      where: {
        date_platform_visitorKeyHash: {
          date: today,
          platform,
          visitorKeyHash: hash,
        },
      },
      update: {},
      create: {
        date: today,
        platform,
        visitorKeyHash: hash,
        countryCode: geo?.countryCode ?? null,
        region: geo?.region ?? null,
      },
    });
  }

  async getDailyTrend(
    days = 30,
  ): Promise<{ date: string; web: number; mobile: number; total: number }[]> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days + 1);
    since.setUTCHours(0, 0, 0, 0);

    const rows = await this.prisma.visitorVisit.groupBy({
      by: ['date', 'platform'],
      where: { date: { gte: since } },
      _count: { visitorKeyHash: true },
      orderBy: { date: 'asc' },
    });

    const map = new Map<string, { web: number; mobile: number }>();
    for (const row of rows) {
      const key = row.date.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, { web: 0, mobile: 0 });
      const entry = map.get(key)!;
      if (row.platform === 'web') entry.web = row._count.visitorKeyHash;
      if (row.platform === 'mobile') entry.mobile = row._count.visitorKeyHash;
    }

    return Array.from(map.entries()).map(([date, v]) => ({
      date,
      web: v.web,
      mobile: v.mobile,
      total: v.web + v.mobile,
    }));
  }

  async getTotals(
    days = 30,
  ): Promise<{ web: number; mobile: number; total: number }> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days + 1);
    since.setUTCHours(0, 0, 0, 0);

    const [web, mobile] = await Promise.all([
      this.prisma.visitorVisit.count({
        where: { platform: 'web', date: { gte: since } },
      }),
      this.prisma.visitorVisit.count({
        where: { platform: 'mobile', date: { gte: since } },
      }),
    ]);
    return { web, mobile, total: web + mobile };
  }

  async getGeoStats(
    days = 30,
  ): Promise<{ countryCode: string; count: number; percent: number }[]> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days + 1);
    since.setUTCHours(0, 0, 0, 0);

    const rows = await this.prisma.visitorVisit.groupBy({
      by: ['countryCode'],
      where: { date: { gte: since }, countryCode: { not: null } },
      _count: { id: true },
    });

    const total = rows.reduce((sum, row) => sum + row._count.id, 0);
    return rows
      .filter((row): row is typeof row & { countryCode: string } =>
        Boolean(row.countryCode),
      )
      .map((row) => ({
        countryCode: row.countryCode,
        count: row._count.id,
        percent: total ? Math.round((row._count.id / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }
}
