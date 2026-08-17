import { useCallback } from 'react';
import { useConfirmSeasonPassSession } from './use-confirm-season-pass-session';
import { usePaymentSessionReturn } from './use-payment-session-return';
import type { PaymentProviderId } from '../types/payment-provider';

interface Options {
  paid: boolean;
  sessionId: string | null;
  provider?: PaymentProviderId;
  enabled: boolean;
}

export function useSeasonPassPaymentReturn({ paid, sessionId, provider, enabled }: Options) {
  const { mutateAsync } = useConfirmSeasonPassSession();
  const confirm = useCallback(
    (id: string) =>
      mutateAsync({ sessionId: id, provider, returnUrl: window.location.href }),
    [mutateAsync, provider],
  );
  const isActivated = useCallback((res: { status: string }) => res.status === 'ACTIVE', []);

  return usePaymentSessionReturn({
    kind: 'season',
    paid,
    sessionId,
    enabled,
    invalidateKey: ['ticketing', 'season-pass'],
    isActivated,
    confirm,
  });
}
