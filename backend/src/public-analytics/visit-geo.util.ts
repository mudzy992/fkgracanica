import geoip from 'geoip-lite';

export type VisitGeo = { countryCode: string; region: string | null };

export function resolveVisitGeo(ip?: string): VisitGeo | null {
  if (!ip || ip === '::1' || ip.startsWith('127.')) return null;
  const hit = geoip.lookup(ip);
  if (!hit?.country) return null;
  return { countryCode: hit.country, region: hit.region || null };
}
