import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  isPaymentSessionConfirmed,
  markPaymentSessionConfirmed,
} from '../lib/payment-session';

interface Options<T> {
  kind: 'tickets' | 'membership';
  paid: boolean;
  sessionId: string | null;
  enabled: boolean;
  invalidateKey: readonly string[];
  isActivated: (result: T) => boolean;
  confirm: (sessionId: string) => Promise<T>;
}

export function usePaymentSessionReturn<T>({
  kind,
  paid,
  sessionId,
  enabled,
  invalidateKey,
  isActivated,
  confirm,
}: Options<T>) {
  const qc = useQueryClient();
  const startedRef = useRef(false);
  const confirmRef = useRef(confirm);
  const isActivatedRef = useRef(isActivated);
  confirmRef.current = confirm;
  isActivatedRef.current = isActivated;
  const [done, setDone] = useState(() => !paid);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!paid) {
      setDone(true);
      return;
    }
    if (!enabled) return;
    if (startedRef.current) return;
    startedRef.current = true;

    if (!sessionId) {
      setDone(true);
      return;
    }

    if (isPaymentSessionConfirmed(kind, sessionId)) {
      setActivated(true);
      setDone(true);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const res = await confirmRef.current(sessionId);
        if (cancelled) return;
        markPaymentSessionConfirmed(kind, sessionId);
        if (isActivatedRef.current(res)) setActivated(true);
      } finally {
        if (!cancelled) {
          await qc.invalidateQueries({ queryKey: [...invalidateKey] });
          setDone(true);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [paid, sessionId, enabled, kind, invalidateKey, qc]);

  return {
    confirming: paid && !done,
    activated,
  };
}
