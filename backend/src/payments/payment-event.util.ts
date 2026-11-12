import type { PrismaService } from '../prisma/prisma.service';

/**
 * Idempotencija obrade plaćanja (BE-07 / P-B07-2 (A)).
 *
 * Problem: `confirm-session` (FE/mobile nakon povratka sa plaćanja) i webhook
 * potvrde istu uplatu; `confirmMembershipFlow` na `ACTIVE` članstvu dodaje
 * +365 dana pri svakom pozivu → jedno plaćanje = do 2 godine, svaki retry
 * webhooka još po godinu.
 *
 * Rješenje: `PaymentEvent(provider, externalId)` je **claim** — prvi obrađivač
 * upiše red, svaki sljedeći dobije `false` (P2002 na unique ključu) i posao se
 * ne ponavlja. Ako obrada padne, claim se **oslobađa** (`release`), da retry
 * može proći.
 *
 * Napomena: bez `externalId` (npr. blagajna) nema idempotencije — takvi tokovi
 * su ionako vezani na interni status (v. `confirmBoxOfficePayment`).
 */
export type PaymentEventKind = 'tickets' | 'membership' | 'season_pass';

export interface PaymentEventKey {
  provider: string;
  externalId: string;
  kind: PaymentEventKind;
  refId: string;
}

export function paymentEventKey(
  provider: string,
  externalId: string | null | undefined,
  kind: PaymentEventKind,
  refId: string,
): PaymentEventKey | null {
  const id = (externalId ?? '').trim();
  if (!id) return null;
  return { provider, externalId: id, kind, refId };
}

export function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return code === 'P2002';
}

/** `true` = ovaj poziv smije obraditi uplatu; `false` = već obrađeno. */
export async function claimPaymentEvent(
  prisma: PrismaService,
  key: PaymentEventKey,
): Promise<boolean> {
  try {
    await prisma.paymentEvent.create({
      data: {
        provider: key.provider,
        externalId: key.externalId,
        kind: key.kind,
        refId: key.refId,
      },
    });
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}

export async function releasePaymentEvent(
  prisma: PrismaService,
  key: PaymentEventKey,
): Promise<void> {
  try {
    await prisma.paymentEvent.delete({
      where: {
        provider_externalId: {
          provider: key.provider,
          externalId: key.externalId,
        },
      },
    });
  } catch {
    /* claim nije nastao ili je već očišćen — nema šta vratiti */
  }
}

/**
 * Izvrši `run` najviše jednom po (provider, externalId).
 * Vraća `false` ako je uplata već obrađena (bez izvršavanja `run`).
 */
export async function runPaymentEventOnce(
  prisma: PrismaService,
  key: PaymentEventKey | null,
  run: () => Promise<boolean>,
): Promise<boolean> {
  if (!key) return run();
  if (!(await claimPaymentEvent(prisma, key))) return false;
  try {
    return await run();
  } catch (error) {
    await releasePaymentEvent(prisma, key);
    throw error;
  }
}
