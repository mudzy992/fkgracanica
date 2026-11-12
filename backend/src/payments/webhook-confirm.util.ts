import {
  confirmMembershipFlow,
  confirmTicketOrderFlow,
} from './stripe-confirm.flow';
import { confirmSeasonPassFlow } from '../ticketing/season-pass-confirm.util';
import {
  notifyMembershipActive,
  notifySeasonPassActive,
  notifyTicketPaid,
} from './payment-notify';
import {
  paymentEventKey,
  runPaymentEventOnce,
  type PaymentEventKind,
} from './payment-event.util';
import type { PrismaService } from '../prisma/prisma.service';
import type { JobsService } from '../jobs/jobs.module';
import type { NotificationsService } from '../notifications/notifications.service';

export type WebhookConfirmInput = {
  provider: string;
  /** ID koji je provider poslao (order id / session id) — ključ idempotencije. */
  externalId: string;
  kind: PaymentEventKind;
  refId: string;
};

/**
 * Zajednička potvrda iz webhooka za PayPal i Monri (BE-07/P-B07-2 A).
 *
 * Svaka uplata se obrađuje najviše jednom po `(provider, externalId)` —
 * retry webhooka ne može dvaput produžiti članstvo niti dvaput poslati email.
 * Vraća `true` ako je ovaj poziv zaista potvrdio uplatu (i poslao notifikacije).
 */
export async function confirmFromWebhook(
  prisma: PrismaService,
  jobs: JobsService,
  notifications: NotificationsService,
  input: WebhookConfirmInput,
): Promise<boolean> {
  const key = paymentEventKey(
    input.provider,
    input.externalId,
    input.kind,
    input.refId,
  );
  if (input.kind === 'tickets') {
    const fresh = await runPaymentEventOnce(prisma, key, () =>
      confirmTicketOrderFlow(prisma, input.refId),
    );
    if (fresh) await notifyTicketPaid(prisma, jobs, input.refId, notifications);
    return fresh;
  }
  if (input.kind === 'membership') {
    const fresh = await runPaymentEventOnce(prisma, key, () =>
      confirmMembershipFlow(prisma, input.refId),
    );
    if (fresh)
      await notifyMembershipActive(prisma, jobs, input.refId, notifications);
    return fresh;
  }
  const fresh = await runPaymentEventOnce(prisma, key, () =>
    confirmSeasonPassFlow(prisma, input.refId, {
      paymentProvider: input.provider,
      externalId: input.externalId,
    }),
  );
  if (fresh)
    await notifySeasonPassActive(prisma, jobs, input.refId, notifications);
  return fresh;
}
