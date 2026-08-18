export const SPONSOR_TIER_ORDER = ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER'] as const;
export type SponsorTierKey = (typeof SPONSOR_TIER_ORDER)[number];

export const SPONSOR_TIER_I18N: Record<SponsorTierKey, string> = {
  GENERAL: 'sponsorGeneral',
  GOLD: 'sponsorGold',
  SILVER: 'sponsorSilver',
  BRONZE: 'sponsorBronze',
  PARTNER: 'sponsorPartner',
};

export function normalizeSponsorTier(tier?: string): SponsorTierKey {
  return SPONSOR_TIER_ORDER.includes(tier as SponsorTierKey) ? (tier as SponsorTierKey) : 'PARTNER';
}
