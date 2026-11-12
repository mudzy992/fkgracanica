/**
 * Allowlist za `origin` koji server potpisuje u Monri formi (BE-07 / P-B07-5).
 *
 * Prije: `GET /payments/monri/form?origin=` je prihvatao bilo koji `http…`
 * string → server je potpisivao `success_url_override`/`cancel_url_override`
 * na napadačev domen (phishing i lažna „potvrda“ plaćanja).
 *
 * Dozvoljeni origin-i = `CORS_ORIGINS` (lista razdvojena zapetom) + origin
 * `API_PUBLIC_URL`. Poređenje je normalizovano (bez završnog `/`, lowercase).
 */
export function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '').toLowerCase();
}

export function allowedOrigins(
  corsOrigins?: string | null,
  apiPublicUrl?: string | null,
): string[] {
  const fromList = (corsOrigins ?? '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
  const fromApi = originOf(apiPublicUrl);
  const all = fromApi ? [...fromList, fromApi] : fromList;
  return [...new Set(all)];
}

export function isAllowedPaymentOrigin(
  origin: string,
  allowed: readonly string[],
): boolean {
  const target = normalizeOrigin(origin);
  if (!target) return false;
  try {
    const parsed = new URL(target);
    if (parsed.origin !== target) return false;
  } catch {
    return false;
  }
  return allowed.includes(target);
}

function originOf(url?: string | null): string | null {
  if (!url) return null;
  try {
    return normalizeOrigin(new URL(url).origin);
  } catch {
    return null;
  }
}
