const WINDOW_MS = 60_000;
const LIMITS: Record<'web' | 'mobile', number> = { web: 5, mobile: 15 };

const hits = new Map<string, number[]>();

/** BE-05/B-05-01: periodični sweep — ključevi BEZ pogodaka u prozoru se
 *  brišu da Map ne raste beskonačno (svaki jedinstveni posjetilac = ključ).
 *  Brisanje je sigurno: ključ bez recent pogodaka ionako kreće svježi prozor. */
const SWEEP_INTERVAL_MS = 30_000;
let lastSweep = 0;

function sweepStaleKeys(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  const cutoff = now - WINDOW_MS;
  for (const [key, times] of hits) {
    const last = times[times.length - 1];
    if (last === undefined || last <= cutoff) {
      hits.delete(key);
    }
  }
}

export function isVisitRateLimited(
  platform: 'web' | 'mobile',
  visitorKeyHash: string,
): boolean {
  const now = Date.now();
  sweepStaleKeys(now);

  const key = `${platform}:${visitorKeyHash}`;
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
