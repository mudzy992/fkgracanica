import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { useSubscribeNewsletter } from '../../hooks';
import { getApiErrorMessage } from '../../lib/api-error';
import { WidgetSectionHeaderBlock } from '../../components/public/shell/WidgetSectionHeaderBlock';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['newsletter'] };

export function NewsletterWidget({ config }: Props) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
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
    <WidgetSectionShell id="newsletter">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="border-gradient-club relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-8 sm:p-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative">
          <WidgetSectionHeaderBlock title={title} subtitle={description} />
          {done ? (
            <p className="mt-6 text-center text-success">Hvala na pretplati!</p>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('common.email')}
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
              <Button type="submit" disabled={subscribe.isPending} className="btn-hero-primary shrink-0">
                {t('actions.subscribe')}
              </Button>
              {subscribe.isError && (
                <p className="text-sm text-danger sm:col-span-2">
                  {getApiErrorMessage(subscribe.error, 'Pretplata nije uspjela. Provjerite email i pokušajte ponovo.')}
                </p>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </WidgetSectionShell>
  );
}
