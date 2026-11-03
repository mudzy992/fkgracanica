import { HttpException, HttpStatus } from '@nestjs/common';

/** BE-09/P-B09-3 (odobreno): dnevna kvota uploada po korisniku. */
export const DAILY_UPLOAD_LIMIT = 20;
export const UPLOAD_QUOTA_TTL_SECONDS = 24 * 60 * 60;

/** Ključ je po korisniku i po danu (UTC) — kvota se resetuje u ponoć. */
export function uploadQuotaKey(userId: string, now: Date = new Date()): string {
  return `upload:quota:${userId}:${now.toISOString().slice(0, 10)}`;
}

/**
 * BE-09/P-B09-3: 21. upload u danu → **429** (prije: samo globalni 100 req/min
 * po IP-u, pa je jedan nalog mogao napuniti disk). Vraća `false` kad Redis nije
 * dostupan (kvota je zaštita od zloupotrebe, ne od ispravnog rada).
 */
export function assertUploadQuota(count: number | null): void {
  if (count === null) return;
  if (count > DAILY_UPLOAD_LIMIT) {
    throw new HttpException(
      `Dnevna kvota uploada je ${DAILY_UPLOAD_LIMIT} slika — pokušajte sutra.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
