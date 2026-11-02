import type { Request } from 'express';

/**
 * BE-05/B-05-02: `req.ip` je ispravan izbor jer BE-01/Q-11 postavlja
 * `trust proxy = 1` (Express računa IP iz XFF-a samo kroz poverene hopove
 * — desna/neiskorištena XFF polja klijenta se NE prihvataju).
 *
 * Ranija verzija je uzimala PRVU XFF vrijednost — to je klijentski
 * spoofable (otvaralo bi geo statistiku lažnim zaglavljem).
 */
export function getClientIp(req: Request): string | undefined {
  return req.ip || undefined;
}
