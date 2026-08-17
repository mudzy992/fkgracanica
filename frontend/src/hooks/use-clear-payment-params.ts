import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export function useClearPaymentParams(done: boolean) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!done || clearedRef.current) return;
    const hasPaid = searchParams.get('paid');
    const hasSession = searchParams.get('session_id') || searchParams.get('token');
    if (!hasPaid && !hasSession) return;

    clearedRef.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete('paid');
    next.delete('session_id');
    next.delete('provider');
    next.delete('token');
    next.delete('PayerID');
    next.delete('digest');
    next.delete('response_code');
    next.delete('order_number');
    const q = next.toString();
    navigate({ pathname, search: q ? `?${q}` : '' }, { replace: true });
  }, [done, navigate, pathname, searchParams]);
}
