import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { confirmPaymentOnce } from '../lib/payment-confirm-once';
import {
  isPaymentSessionConfirmed,
  markPaymentSessionConfirmed,
  paymentSessionKey,
  type PaymentSession,
} from '../lib/payment-session';

export type PaymentReturnStatus = 'idle' | 'confirming' | 'pending' | 'error' | 'activated';

type Options<T> = Omit<PaymentSession, 'sessionId' | 'userId'> & {
  paid: boolean;
  sessionId: string | null;
  userId: string | null;
  enabled: boolean;
  invalidateKey: readonly string[];
  isActivated: (result: T) => boolean;
  confirm: (sessionId: string) => Promise<T>;
};

type Result = { key: string; status: Exclude<PaymentReturnStatus, 'idle'> };

export function usePaymentSessionReturn<T>({
  kind, paid, sessionId, userId, provider, enabled, invalidateKey, isActivated, confirm,
}: Options<T>) {
  const qc = useQueryClient();
  const confirmRef = useRef(confirm);
  const isActivatedRef = useRef(isActivated);
  const invalidateKeyRef = useRef(invalidateKey);
  const retryRequested = useRef(false);
  confirmRef.current = confirm;
  isActivatedRef.current = isActivated;
  invalidateKeyRef.current = invalidateKey;
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);

  const ready = paid && enabled && !!sessionId && !!userId;
  const key = ready ? paymentSessionKey({ kind, sessionId, userId, provider }) : null;
  const status: PaymentReturnStatus = !key
    ? 'idle'
    : result?.key === key ? result.status : 'confirming';

  useEffect(() => {
    if (!key || !sessionId || !userId) {
      retryRequested.current = false;
      setResult(null);
      return;
    }
    const session: PaymentSession = { kind, sessionId, userId, provider };
    if (isPaymentSessionConfirmed(session)) {
      retryRequested.current = false;
      setResult({ key, status: 'activated' });
      return;
    }

    let cancelled = false;
    const confirmSession = confirmRef.current;
    const checkActivated = isActivatedRef.current;
    const queryKey = [...invalidateKeyRef.current];
    setResult({ key, status: 'confirming' });
    const request = confirmPaymentOnce(key, () => confirmSession(sessionId));
    const finish = async () => {
      let next: 'activated' | 'pending' | 'error';
      try {
        const response = await request;
        next = checkActivated(response) ? 'activated' : 'pending';
      } catch {
        next = 'error';
      }
      if (cancelled) return;
      if (next === 'activated') markPaymentSessionConfirmed(session);
      // Refetch asynchronously; a failed or slow refresh must not trap the user on a skeleton.
      void qc.invalidateQueries({ queryKey }).catch(() => undefined);
      retryRequested.current = false;
      setResult({ key, status: next });
    };
    void finish();
    return () => { cancelled = true; };
  }, [attempt, key, kind, provider, qc, sessionId, userId]);

  const retry = useCallback(() => {
    if (!key || (status !== 'pending' && status !== 'error') || retryRequested.current) return;
    retryRequested.current = true;
    setResult({ key, status: 'confirming' });
    setAttempt((previous) => previous + 1);
  }, [key, status]);

  return { status, confirming: status === 'confirming', activated: status === 'activated', retry };
}
