import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirmTicketSession } from './use-confirm-ticket-session';

interface Options {
  paid: boolean;
  sessionId: string | null;
  enabled: boolean;
}

export function useTicketPaymentReturn({ paid, sessionId, enabled }: Options) {
  const qc = useQueryClient();
  const confirm = useConfirmTicketSession();
  const [done, setDone] = useState(!paid);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!enabled || !paid || done) return;

    const run = async () => {
      try {
        if (sessionId) {
          const res = await confirm.mutateAsync(sessionId);
          if (res.status === 'paid') setActivated(true);
        }
      } finally {
        await qc.invalidateQueries({ queryKey: ['ticketing', 'orders'] });
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
