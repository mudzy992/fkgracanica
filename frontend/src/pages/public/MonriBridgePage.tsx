import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Skeleton } from '../../components/ui/skeleton';
import { Seo } from '../../components/seo/Seo';
import { useTranslation } from 'react-i18next';

type FormPayload = { action: string; fields: Record<string, string> };

export function MonriBridgePage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid') ?? '';
  const [error, setError] = useState('');
  const submitted = useRef(false);

  useEffect(() => {
    if (isLoading || submitted.current) return;
    if (!isAuthenticated) {
      setError(t('pages.monri.needLogin'));
      return;
    }
    if (!sid) {
      setError(t('pages.monri.missingSession'));
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
        setError(t('pages.monri.formNotReady'));
      }
    })();
  }, [isAuthenticated, isLoading, sid]);

  // FE-03/P-FE03-7: payment bridge ne smije u indeks pretraživača.
  const seo = <Seo title={t('pages.monri.seoTitle')} noindex />;

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-text-muted">
        {seo}
        <p>{error}</p>
        <Link
          className="mt-4 inline-block text-primary"
          to={sid.startsWith('m-') ? '/clanstvo' : '/ulaznice'}
        >
          {t('pages.monri.back')}
        </Link>
      </div>
    );
  }

  return (
    <>
      {seo}
      <Skeleton className="mx-auto mt-16 h-32 max-w-md" />
    </>
  );
}
