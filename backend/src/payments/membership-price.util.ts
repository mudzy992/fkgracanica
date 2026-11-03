import type { PrismaService } from '../prisma/prisma.service';

export const DEFAULT_MEMBERSHIP_PRICE = 50;

/**
 * Cijena godišnjeg članstva — **isključivo sa servera** (BE-07 / P-B07-1).
 *
 * Klijentski `amount` iz checkout bodyja se ignoriše: ranije je bilo moguće
 * poslati npr. 0.01 i dobiti članstvo na 365 dana. Monri je i prije koristio
 * ovu vrijednost — sada svi provideri rade isto.
 *
 * Fallback: ako vrijednost nije pozitivan broj → DEFAULT_MEMBERSHIP_PRICE
 * (isto ponašanje kao postojeći Finance/Monri kod: `Number(value || '50')`).
 */
export async function readMembershipAmount(
  prisma: PrismaService,
): Promise<number> {
  const row = await prisma.setting.findUnique({
    where: { key: 'membership.annualPrice' },
  });
  const amount = Number(row?.value ?? DEFAULT_MEMBERSHIP_PRICE);
  if (!Number.isFinite(amount) || amount <= 0) return DEFAULT_MEMBERSHIP_PRICE;
  return amount;
}
