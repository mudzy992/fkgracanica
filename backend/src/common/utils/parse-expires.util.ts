/**
 * Trajanje u ms iz kratkog oblika (`15m`, `7d`, `12h`, `60s`).
 *
 * BE-09 / P-B09-5: prije je neispravan format **tiho** vraćao 15 min, a
 * `0s`/`999999d` su prolazili — greška u `JWT_REFRESH_EXPIRES` se nikad nije
 * vidjela. Sada: neispravan format / nula / > 90 dana → greška (fail-fast).
 */

const UNITS_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/** Gornja granica (sigurnosna): refresh token ne smije živjeti duže od 90 dana. */
export const MAX_EXPIRES_MS = 90 * 24 * 60 * 60 * 1000;

export function parseExpiresToMs(expires: string): number {
  const raw = typeof expires === 'string' ? expires.trim() : '';
  const match = /^(\d{1,7})([smhd])$/.exec(raw);
  if (!match) {
    throw new Error(
      `Neispravno trajanje "${expires}" — očekivano npr. 15m, 12h, 7d, 60s.`,
    );
  }
  const value = Number(match[1]);
  const ms = value * (UNITS_MS[match[2]] ?? 0);
  if (value <= 0 || ms <= 0) {
    throw new Error(`Trajanje "${raw}" mora biti veće od nule.`);
  }
  if (ms > MAX_EXPIRES_MS) {
    throw new Error(
      `Trajanje "${raw}" je preveliko — maksimalno ${MAX_EXPIRES_MS / UNITS_MS.d} dana.`,
    );
  }
  return ms;
}
