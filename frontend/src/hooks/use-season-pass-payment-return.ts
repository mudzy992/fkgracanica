import { useCallback } from 'react';
import { useConfirmSeasonPassSession } from './use-confirm-season-pass-session';
import { usePaymentSessionReturn } from './use-payment-session-return';
import type { PaymentProviderId } from '../types/payment-provider';

const SEASON_PASS_KEY = ['ticketing', 'season-pass'] as const;

interface Options {
  paid: boolean;
  sessionId: string | null;
  provider?: PaymentProviderId;
  enabled: boolean;
  userId: string | null;
}

export function useSeasonPassPaymentReturn({ paid, sessionId, provider, enabled, userId }: Options) {
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
    userId,
    provider,
    enabled,
    invalidateKey: SEASON_PASS_KEY,
    isActivated,
    confirm,
  });
}
