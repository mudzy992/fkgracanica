import type { PaymentProviderId } from '../types/payment-provider';

export interface PaymentSession {
  kind: 'tickets' | 'membership' | 'season';
  sessionId: string;
  userId: string;
  provider?: PaymentProviderId;
}

// V1 markers could have been written for an unpaid response and are not trusted.
export function paymentSessionKey({ kind, sessionId, userId, provider }: PaymentSession) {
  return `fk_confirm_v2:${JSON.stringify([userId, kind, provider ?? '', sessionId])}`;
}

export function isPaymentSessionConfirmed(session: PaymentSession) {
  try {
    return sessionStorage.getItem(paymentSessionKey(session)) === '1';
  } catch {
    return false;
  }
}

export function markPaymentSessionConfirmed(session: PaymentSession) {
  try {
    sessionStorage.setItem(paymentSessionKey(session), '1');
  } catch {
    /* Storage can be unavailable; the server response remains authoritative. */
  }
}
