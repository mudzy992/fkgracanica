import { readFileSync } from 'node:fs';
import { Logger } from '@nestjs/common';

export type RedisTlsOptions = { tls: { ca: Buffer } };

const logger = new Logger('RedisTls');

/**
 * Vraća TLS opcije za ioredis kada je REDIS_URL sheme `rediss://`.
 *
 * ioredis (a ni BullMQ koji ga koristi) ne čitaju CA fajl iz URL-a — bez
 * eksplicitnog `tls.ca` klijent vjeruje isključivo Node root store-u, što
 * za privatni Coolify CA završava sa:
 *   "self-signed certificate in certificate chain"
 *
 * Putanja CA-a dolazi iz pozivaoca (BE-01/P2: common/ više ne čita
 * `process.env` direktno — pozivatelj proslijeđuje REDIS_TLS_CA vrijednost).
 * Ako fajl nije čitljiv, loguje se upozorenje i veza pada na Node root
 * store (gdje eventualno pomaže NODE_EXTRA_CERTS).
 */
export function buildRedisTlsOptions(
  url: string | undefined,
  caPath: string | undefined,
): RedisTlsOptions | undefined {
  if (!url || !url.startsWith('rediss://')) return undefined;

  if (!caPath) return undefined;

  try {
    return { tls: { ca: readFileSync(caPath) } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(
      `REDIS_TLS_CA (${caPath}) nije čitljiv: ${message} — ` +
        'TLS nastavlja bez eksplicitnog CA-a (Node root store).',
    );
    return undefined;
  }
}
