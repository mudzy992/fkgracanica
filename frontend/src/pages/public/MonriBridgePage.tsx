import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Skeleton } from '../../components/ui/skeleton';

type FormPayload = { action: string; fields: Record<string, string> };

export function MonriBridgePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid') ?? '';
  const [error, setError] = useState('');
  const submitted = useRef(false);

  useEffect(() => {
    if (isLoading || submitted.current) return;
    if (!isAuthenticated) {
      setError('Prijava je potrebna za plaćanje.');
      return;
    }
    if (!sid) {
      setError('Nedostaje Monri sesija.');
      return;
    }
    submitted.current = true;
    void (async () => {
      try {
        const origin = window.location.origin;
        const { data } = await api.get<FormPayload>('/payments/monri/form', {
          params: { sessionId: sid, origin },
        });
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.action;
        for (const [name, value] of Object.entries(data.fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } catch {
        setError('Monri forma nije spremna. Provjerite ključeve u adminu.');
      }
    })();
  }, [isAuthenticated, isLoading, sid]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-text-muted">
        <p>{error}</p>
        <Link className="mt-4 inline-block text-primary" to={sid.startsWith('m-') ? '/clanstvo' : '/ulaznice'}>
          Nazad
        </Link>
      </div>
    );
  }

  return <Skeleton className="mx-auto mt-16 h-32 max-w-md" />;
}
