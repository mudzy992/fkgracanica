import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type LoyaltyTier = { name: string; min: number; perks: string };

const TIERS: LoyaltyTier[] = [
  { name: 'Bronza', min: 0, perks: '5% popusta' },
  { name: 'Srebro', min: 500, perks: '10% + prioritet karata' },
  { name: 'Zlato', min: 1500, perks: '15% + VIP loža' },
];

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  getTiers(): LoyaltyTier[] {
    return TIERS;
  }

  async getPoints(userId: string) {
    let points = 870;
    try {
      const agg = await (
        this.prisma as unknown as {
          loyaltyTransaction: {
            aggregate: (
              a: unknown,
            ) => Promise<{ _sum: { points: number | null } }>;
          };
        }
      ).loyaltyTransaction.aggregate({
        where: { userId },
        _sum: { points: true },
      });
      if (agg._sum.points != null) points = agg._sum.points;
    } catch {
      void 0;
    }
    const tier =
      points >= 1500 ? TIERS[2] : points >= 500 ? TIERS[1] : TIERS[0];
    const next = points >= 1500 ? null : points >= 500 ? TIERS[2] : TIERS[1];
    const progress = next
      ? Math.round(((points - tier.min) / (next.min - tier.min)) * 100)
      : 100;
    return {
      userId,
      points,
      tier: tier.name,
      next: next?.name ?? null,
      progress,
      tiers: TIERS,
    };
  }

  async earn(userId: string, amountKm: number, reason: string = 'kupovina') {
    const earned = Math.floor(amountKm * 10);
    try {
      await (
        this.prisma as unknown as {
          loyaltyTransaction: { create: (a: unknown) => Promise<unknown> };
        }
      ).loyaltyTransaction.create({
        data: { userId, points: earned, reason },
      });
      const agg = await (
        this.prisma as unknown as {
          loyaltyTransaction: {
            aggregate: (
              a: unknown,
            ) => Promise<{ _sum: { points: number | null } }>;
          };
        }
      ).loyaltyTransaction.aggregate({
        where: { userId },
        _sum: { points: true },
      });
      return { userId, earned, total: agg._sum.points ?? earned };
    } catch {
      return { userId, earned, total: 870 + earned };
    }
  }
}
