import { BadRequestException } from '@nestjs/common';
import type { PaymentProviderId } from './providers/payment-provider.interface';

/**
 * Validacija checkout bodyja (BE-07 / P-B07-4).
 *
 * Prije: `provider` je išao direktno u `map[explicit]` → nepoznata vrijednost
 * je bila TypeError → **500**. Sada: **400** sa jasnom porukom. Isto za
 * obavezne identifikatore i povratne URL-ove (bez njih provider baca 500
 * ili kreira sesiju sa praznim URL-om).
 */
const PROVIDERS: readonly PaymentProviderId[] = ['stripe', 'paypal', 'monri'];

export function parseProviderId(
  raw?: string | null,
): PaymentProviderId | undefined {
  if (raw === undefined || raw === null) return undefined;
  const id = String(raw).trim().toLowerCase();
  if (!id) return undefined;
  const hit = PROVIDERS.find((p) => p === id);
  if (!hit) throw new BadRequestException('Nepoznat način plaćanja');
  return hit;
}

export function requireId(raw: unknown, message: string): string {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) throw new BadRequestException(message);
  return value;
}

export function requireHttpUrl(raw: unknown, message: string): string {
  const value = requireId(raw, message);
  let protocol = '';
  try {
    protocol = new URL(value).protocol;
  } catch {
    throw new BadRequestException(message);
  }
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new BadRequestException(message);
  }
  return value;
}

export function parsePageNumber(raw: unknown, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}
