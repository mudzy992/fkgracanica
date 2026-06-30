import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscribeNewsletter } from '../../../hooks';
import { getApiErrorMessage } from '../../../lib/api-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';

export function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const subscribe = useSubscribeNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subscribe.mutateAsync(email);
      setDone(true);
      setEmail('');
    } catch {
      /* error shown via subscribe.isError */
    }
  };

  return (
    <section className="bg-primary py-12 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <Card className="border-0 bg-white/10 text-white">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold">{t('home.newsletter')}</h2>
            <p className="mt-2 text-white/80">{t('home.newsletterDesc')}</p>
            {done ? (
              <p className="mt-4 text-success">Hvala na pretplati!</p>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('common.email')}
                  className="bg-white text-text"
                />
                <Button type="submit" disabled={subscribe.isPending} className="bg-white text-primary">
                  {t('actions.subscribe')}
                </Button>
                {subscribe.isError && (
                  <p className="text-sm text-red-200">
                    {getApiErrorMessage(subscribe.error, 'Pretplata nije uspjela. Provjerite email i pokušajte ponovo.')}
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
