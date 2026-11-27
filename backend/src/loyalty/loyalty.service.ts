import { Injectable } from '@nestjs/common';

export type LoyaltyTier = { name: string; min: number; perks: string };

const TIERS: LoyaltyTier[] = [
  { name: 'Bronza', min: 0, perks: '5% popusta' },
  { name: 'Srebro', min: 500, perks: '10% + prioritet karata' },
  { name: 'Zlato', min: 1500, perks: '15% + VIP loža' },
];

@Injectable()
export class LoyaltyService {
  getTiers(): LoyaltyTier[] {
    return TIERS;
  }

  getPoints(userId: string) {
    // Mock — u P-PREMIUM-04 veže se na Payment/Membership
    const points = 870;
    const tier = points >= 1500 ? TIERS[2] : points >= 500 ? TIERS[1] : TIERS[0];
    const next = points >= 1500 ? null : points >= 500 ? TIERS[2] : TIERS[1];
    const progress = next ? Math.round(((points - tier.min) / (next.min - tier.min)) * 100) : 100;
    return { userId, points, tier: tier.name, next: next?.name ?? null, progress, tiers: TIERS };
  }

  earn(userId: string, amountKm: number) {
    const earned = Math.floor(amountKm * 10); // 10 bodova po KM
    return { userId, earned, total: 870 + earned };
  }
}
