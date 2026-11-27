export type Sponsor = {
  id: string;
  name: string;
  logoPath?: string | null;
  url?: string | null;
  tier: string;
};

export const SPONSOR_TIER_ORDER = ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER'] as const;
export type SponsorTierKey = (typeof SPONSOR_TIER_ORDER)[number];

export const SPONSOR_TIER_META: Record<SponsorTierKey, { label: string; subtitle: string }> = {
  GENERAL: { label: 'Glavni sponzor', subtitle: 'Strateški partner kluba' },
  GOLD: { label: 'Zlatni sponzori', subtitle: 'Premium partneri' },
  SILVER: { label: 'Srebrni sponzori', subtitle: 'Pouzdana podrška' },
  BRONZE: { label: 'Bronzani sponzori', subtitle: 'Zajednica koja raste s nama' },
  PARTNER: { label: 'Partneri', subtitle: 'Zahvaljujemo se na povjerenju' },
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
