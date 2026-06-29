import { useCallback } from 'react';
import { useConfirmTicketSession } from './use-confirm-ticket-session';
import { usePaymentSessionReturn } from './use-payment-session-return';

const TICKET_ORDERS_KEY = ['ticketing', 'orders'] as const;

interface Options {
  paid: boolean;
  sessionId: string | null;
  enabled: boolean;
}

export function useTicketPaymentReturn({ paid, sessionId, enabled }: Options) {
  const { mutateAsync } = useConfirmTicketSession();
  const confirm = useCallback((id: string) => mutateAsync(id), [mutateAsync]);
  const isActivated = useCallback((res: { status: string }) => res.status === 'paid', []);

  return usePaymentSessionReturn({
    kind: 'tickets',
    paid,
    sessionId,
    enabled,
    invalidateKey: TICKET_ORDERS_KEY,
    isActivated,
    confirm,
  });
}
