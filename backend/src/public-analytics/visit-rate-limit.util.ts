const WINDOW_MS = 60_000;
const LIMITS: Record<'web' | 'mobile', number> = { web: 5, mobile: 15 };

const hits = new Map<string, number[]>();

export function isVisitRateLimited(platform: 'web' | 'mobile', visitorKeyHash: string): boolean {
  const key = `${platform}:${visitorKeyHash}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);
  if (recent.length >= LIMITS[platform]) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}
