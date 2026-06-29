import { useCallback } from 'react';
import { useConfirmMembershipSession } from './use-confirm-membership-session';
import { usePaymentSessionReturn } from './use-payment-session-return';

const MEMBERSHIP_ME_KEY = ['membership', 'me'] as const;

interface Options {
  paid: boolean;
  sessionId: string | null;
  enabled: boolean;
}

export function useMembershipPaymentReturn({ paid, sessionId, enabled }: Options) {
  const { mutateAsync } = useConfirmMembershipSession();
  const confirm = useCallback((id: string) => mutateAsync(id), [mutateAsync]);
  const isActivated = useCallback((res: { status: string }) => res.status === 'ACTIVE', []);

  return usePaymentSessionReturn({
    kind: 'membership',
    paid,
    sessionId,
    enabled,
    invalidateKey: MEMBERSHIP_ME_KEY,
    isActivated,
    confirm,
  });
}
