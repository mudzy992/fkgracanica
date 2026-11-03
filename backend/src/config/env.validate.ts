/**
 * Env validacija pri startu aplikacije (BE-01 / P1 — odobreno).
 *
 * Radi unutar `ConfigModule.forRoot({ validate })` — bez novih npm zavisnosti
 * (joi/zod namjerno NE koristimo; pravilo 7: zero-dep preferencija).
 * Nevalidan/nepotpun env = aplikacija odbija startati s jasnom porukom
 * umjesto tihog runtime kvara (npr. JWT potpisan s `undefined`).
 *
 * Obavezne varijable moraju postojati i u dev, test i prod okruženju —
 * `.env` (lokalni) i Coolify env (produkcija) ih već sadrže.
 */

import { parseExpiresToMs } from '../common/utils/parse-expires.util';

const REQUIRED = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

export function validateEnv(
  env: Record<string, unknown>,
): Record<string, unknown> {
  const missing = REQUIRED.filter((key) => {
    const value = env[key];
    // env vrijednosti su po definiciji stringovi (process.env/dotenv) —
    // bilo šta drugo (undefined/null/prazno/ne-string) = nedostaje.
    return typeof value !== 'string' || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Nedostaju obavezne environment varijable: ${missing.join(', ')}. ` +
        'Kopiraj .env.example → .env i popuni vrijednosti (vidi docs/BACKEND.md).',
    );
  }

  const port = env.PORT;
  if (
    typeof port === 'string' &&
    port.trim() !== '' &&
    !/^\d+$/.test(port.trim())
  ) {
    throw new Error(`PORT mora biti cijeli broj (dobijeno: "${port.trim()}")`);
  }

  // BE-09/P-B09-5: trajanje refresh tokena se validira na bootu (fail-fast) —
  // prije je neispravna vrijednost tiho padala na 15 min u runtime-u.
  const refreshExpires = env.JWT_REFRESH_EXPIRES;
  if (typeof refreshExpires === 'string' && refreshExpires.trim() !== '') {
    try {
      parseExpiresToMs(refreshExpires);
    } catch (error) {
      throw new Error(
        `JWT_REFRESH_EXPIRES je neispravan: ${(error as Error).message}`,
      );
    }
  }

  return env;
}
