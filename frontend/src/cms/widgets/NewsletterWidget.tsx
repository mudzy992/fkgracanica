import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscribeNewsletter } from '../../hooks';
import { getApiErrorMessage } from '../../lib/api-error';
import { Reveal } from '../../lib/motion/Reveal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['newsletter'] };

export function NewsletterWidget({ config }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const subscribe = useSubscribeNewsletter();
  const title = config.title ?? t('home.newsletter');
  const description = config.description ?? t('home.newsletterDesc');

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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent py-12 text-white md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="glass-dark rounded-2xl p-8 sm:p-10">
            <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
            <p className="mt-2 max-w-xl text-white/85">{description}</p>
            {done ? (
              <p className="mt-6 text-green-300">Hvala na pretplati!</p>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('common.email')}
                  className="bg-white/95 text-text"
                />
                <Button type="submit" disabled={subscribe.isPending} className="bg-white text-primary shrink-0">
                  {t('actions.subscribe')}
                </Button>
                {subscribe.isError && (
                  <p className="text-sm text-red-200 sm:col-span-2">
                    {getApiErrorMessage(subscribe.error, 'Pretplata nije uspjela. Provjerite email i pokušajte ponovo.')}
                  </p>
                )}
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
