import { useCallback } from 'react';
import { useConfirmTicketSession } from './use-confirm-ticket-session';
import { usePaymentSessionReturn } from './use-payment-session-return';
import type { PaymentProviderId } from '../types/payment-provider';

const TICKET_ORDERS_KEY = ['ticketing', 'orders'] as const;

interface Options {
  paid: boolean;
  sessionId: string | null;
  provider?: PaymentProviderId;
  enabled: boolean;
  userId: string | null;
}

export function useTicketPaymentReturn({ paid, sessionId, provider, enabled, userId }: Options) {
  const { mutateAsync } = useConfirmTicketSession();
  const confirm = useCallback(
    (id: string) =>
      mutateAsync({ sessionId: id, provider, returnUrl: window.location.href }),
    [mutateAsync, provider],
  );
  const isActivated = useCallback((res: { status: string }) => res.status === 'paid', []);

  return usePaymentSessionReturn({
    kind: 'tickets',
    paid,
    sessionId,
    userId,
    provider,
    enabled,
    invalidateKey: TICKET_ORDERS_KEY,
    isActivated,
    confirm,
  });
}
