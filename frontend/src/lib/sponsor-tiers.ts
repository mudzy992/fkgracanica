import type { Sponsor } from '../types';

export const SPONSOR_TIER_ORDER = ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER'] as const;
export type SponsorTierKey = (typeof SPONSOR_TIER_ORDER)[number];

export interface SponsorTierMeta {
  label: string;
  subtitle: string;
  variant: 'hero' | 'gold' | 'silver' | 'bronze' | 'partner';
}

export const SPONSOR_TIER_META: Record<SponsorTierKey, SponsorTierMeta> = {
  GENERAL: {
    label: 'Glavni sponzor',
    subtitle: 'Strateški partner kluba',
    variant: 'hero',
  },
  GOLD: {
    label: 'Zlatni sponzori',
    subtitle: 'Premium partneri',
    variant: 'gold',
  },
  SILVER: {
    label: 'Srebrni sponzori',
    subtitle: 'Pouzdana podrška',
    variant: 'silver',
  },
  BRONZE: {
    label: 'Bronzani sponzori',
    subtitle: 'Zajednica koja raste s nama',
    variant: 'bronze',
  },
  PARTNER: {
    label: 'Partneri',
    subtitle: 'Zahvaljujemo se na povjerenju',
    variant: 'partner',
  },
};

export function groupSponsorsByTier(sponsors: Sponsor[]) {
  const map = new Map<SponsorTierKey, Sponsor[]>();
  for (const tier of SPONSOR_TIER_ORDER) map.set(tier, []);
  for (const s of sponsors) {
    const key = SPONSOR_TIER_ORDER.includes(s.tier as SponsorTierKey)
      ? (s.tier as SponsorTierKey)
      : 'PARTNER';
    map.get(key)!.push(s);
  }
  return SPONSOR_TIER_ORDER.map((tier) => ({ tier, sponsors: map.get(tier)! })).filter(
    (g) => g.sponsors.length > 0,
  );
}
