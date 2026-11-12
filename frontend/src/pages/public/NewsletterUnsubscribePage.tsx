import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { FormShell } from '../../components/public/forms/FormShell';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';
import { useTranslation } from 'react-i18next';

export function NewsletterUnsubscribePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [state, setState] = useState<'loading' | 'ok' | 'err'>('loading');

  useEffect(() => {
    if (!token) {
      setState('err');
      return;
    }
    void api
      .get('/newsletter/unsubscribe', { params: { token } })
      .then(() => setState('ok'))
      .catch(() => setState('err'));
  }, [token]);

  return (
    <div className="pb-16">
      <Seo title={t('pages.newsletter.seoTitle')} />
      <PageHeroHeader
        eyebrow={t('pages.newsletter.eyebrow')}
        title={t('pages.newsletter.title')}
        subtitle={t('pages.newsletter.subtitle')}
      />
      <FormShell
        title={t('pages.newsletter.formTitle')}
        description={t('pages.newsletter.formDesc')}
      >
        {state === 'loading' && (
          <p className="text-sm text-text-muted">{t('pages.newsletter.loading')}</p>
        )}
        {state === 'ok' && <p className="text-sm">{t('pages.newsletter.success')}</p>}
        {state === 'err' && <p className="text-sm text-danger">{t('pages.newsletter.invalid')}</p>}
      </FormShell>
    </div>
  );
}
