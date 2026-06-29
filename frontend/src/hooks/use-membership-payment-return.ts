import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirmMembershipSession } from './use-confirm-membership-session';

interface Options {
  paid: boolean;
  sessionId: string | null;
  enabled: boolean;
}

export function useMembershipPaymentReturn({ paid, sessionId, enabled }: Options) {
  const qc = useQueryClient();
  const confirm = useConfirmMembershipSession();
  const [done, setDone] = useState(!paid);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!enabled || !paid || done) return;

    const run = async () => {
      try {
        if (sessionId) {
          const res = await confirm.mutateAsync(sessionId);
          if (res.status === 'ACTIVE') setActivated(true);
        }
      } finally {
        await qc.invalidateQueries({ queryKey: ['membership', 'me'] });
        setDone(true);
      }
    };

    void run();
  }, [enabled, paid, sessionId, done, qc, confirm]);

  return {
    confirming: paid && !done,
    activated,
    confirmError: confirm.isError,
  };
}
