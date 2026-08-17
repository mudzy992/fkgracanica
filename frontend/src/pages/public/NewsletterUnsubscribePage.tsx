import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { FormShell } from '../../components/public/forms/FormShell';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';

export function NewsletterUnsubscribePage() {
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
      <Seo title="Odjava s newslettera" />
      <PageHeroHeader eyebrow="Newsletter" title="Odjava" subtitle="Upravljanje pretplatom." />
      <FormShell title="Newsletter" description="Odjava s mailing liste FK Gračanica.">
        {state === 'loading' && <p className="text-sm text-text-muted">Obrađujemo zahtjev…</p>}
        {state === 'ok' && <p className="text-sm">Odjavljeni ste. Više nećete primati newsletter.</p>}
        {state === 'err' && <p className="text-sm text-danger">Link nije validan ili je već iskorišten.</p>}
      </FormShell>
    </div>
  );
}
