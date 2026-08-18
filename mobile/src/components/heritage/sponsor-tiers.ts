export const SPONSOR_TIER_ORDER = ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER'] as const;
export type SponsorTierKey = (typeof SPONSOR_TIER_ORDER)[number];

export const SPONSOR_TIER_I18N: Record<SponsorTierKey, string> = {
  GENERAL: 'sponsorGeneral',
  GOLD: 'sponsorGold',
  SILVER: 'sponsorSilver',
  BRONZE: 'sponsorBronze',
  PARTNER: 'sponsorPartner',
};

export const SPONSOR_TIER_SUB: Record<SponsorTierKey, string> = {
  GENERAL: 'sponsorGeneralSub',
  GOLD: 'sponsorGoldSub',
  SILVER: 'sponsorSilverSub',
  BRONZE: 'sponsorBronzeSub',
  PARTNER: 'sponsorPartnerSub',
};

export const SPONSOR_TIER_ACCENT: Record<SponsorTierKey, string> = {
  GENERAL: '#C9A227',
  GOLD: '#C9A227',
  SILVER: '#C0C7D1',
  BRONZE: '#B87333',
  PARTNER: '#64748B',
};

export function normalizeSponsorTier(tier?: string): SponsorTierKey {
  return SPONSOR_TIER_ORDER.includes(tier as SponsorTierKey) ? (tier as SponsorTierKey) : 'PARTNER';
}
