import { useCallback } from 'react';
import { useConfirmMembershipSession } from './use-confirm-membership-session';
import { usePaymentSessionReturn } from './use-payment-session-return';
import type { PaymentProviderId } from '../types/payment-provider';

const MEMBERSHIP_ME_KEY = ['membership', 'me'] as const;

interface Options {
  paid: boolean;
  sessionId: string | null;
  provider?: PaymentProviderId;
  enabled: boolean;
  userId: string | null;
}

export function useMembershipPaymentReturn({ paid, sessionId, provider, enabled, userId }: Options) {
  const { mutateAsync } = useConfirmMembershipSession();
  const confirm = useCallback(
    (id: string) =>
      mutateAsync({ sessionId: id, provider, returnUrl: window.location.href }),
    [mutateAsync, provider],
  );
  const isActivated = useCallback((res: { status: string }) => res.status === 'ACTIVE', []);

  return usePaymentSessionReturn({
    kind: 'membership',
    paid,
    sessionId,
    userId,
    provider,
    enabled,
    invalidateKey: MEMBERSHIP_ME_KEY,
    isActivated,
    confirm,
  });
}
