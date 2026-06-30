import { Link } from 'react-router-dom';
import { ArrowRight, Ticket, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { useSubscribeNewsletter } from '../../hooks';
import { getApiErrorMessage } from '../../lib/api-error';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import { WidgetSectionHeaderBlock } from '../../components/public/shell/WidgetSectionHeaderBlock';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { WidgetConfigMap } from './schemas';

type Props = {
  config: WidgetConfigMap['membership-cta'] | WidgetConfigMap['tickets-cta'] | WidgetConfigMap['newsletter'];
};

function membershipFields(c: Props['config']) {
  if ('buttonUrl' in c || 'text' in c) {
    return {
      text: c.text,
      buttonUrl: 'buttonUrl' in c ? c.buttonUrl : undefined,
      buttonLabel: 'buttonLabel' in c ? c.buttonLabel : undefined,
    };
  }
  return {};
}

export function ClubActionsWidget({ config }: Props) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const membership = membershipFields(config);

  return (
    <WidgetSectionShell id="clanstvo">
      <WidgetSectionHeaderBlock
        title={String(config.title ?? 'Budi dio kluba')}
        subtitle="Članstvo, ulaznice i novosti"
      />
      <ClubActionsGrid config={config} membership={membership} reduce={!!reduce} t={t} />
    </WidgetSectionShell>
  );
}

function ClubActionsGrid({
  config: c,
  membership,
  reduce,
  t,
}: {
  config: Props['config'];
  membership: ReturnType<typeof membershipFields>;
  reduce: boolean;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const subscribe = useSubscribeNewsletter();
  const desc = 'description' in c ? c.description : undefined;

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subscribe.mutateAsync(email);
      setDone(true);
      setEmail('');
    } catch {
      /* shown below */
    }
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid gap-4 lg:grid-cols-3"
    >
      <ActionCard
        icon={<Users className="h-5 w-5" />}
        title={t('home.membership')}
        text={membership.text ?? t('home.membershipDesc')}
        href={membership.buttonUrl ?? '/clanstvo'}
        label={membership.buttonLabel ?? t('home.membership')}
      />
      <ActionCard
        icon={<Ticket className="h-5 w-5" />}
        title={t('home.tickets')}
        text={t('home.ticketsDesc')}
        href="/ulaznice"
        label={t('home.tickets')}
      />
      <div className="border-gradient-club glass-premium flex flex-col justify-between rounded-2xl p-6">
        <div>
          <h3 className="font-display text-lg font-bold uppercase text-white">{t('home.newsletter')}</h3>
          <p className="mt-2 text-sm text-text-muted">{desc ?? t('home.newsletterDesc')}</p>
        </div>
        {done ? (
          <p className="mt-4 text-sm text-success">Hvala na pretplati!</p>
        ) : (
          <form onSubmit={(e) => void handleNewsletter(e)} className="mt-4 space-y-2">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('common.email')}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
            />
            <Button type="submit" disabled={subscribe.isPending} className="btn-hero-primary w-full justify-center">
              {t('actions.subscribe')}
            </Button>
            {subscribe.isError && (
              <p className="text-xs text-danger">
                {getApiErrorMessage(subscribe.error, 'Pretplata nije uspjela.')}
              </p>
            )}
          </form>
        )}
      </div>
    </motion.div>
  );
}

function ActionCard({
  title,
  text,
  href,
  label,
  icon,
}: {
  title: string;
  text: string;
  href: string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className="border-gradient-club glass-premium-blue card-lift flex flex-col justify-between rounded-2xl p-6">
      <div>
        <div className="mb-3 text-primary-light">{icon}</div>
        <h3 className="font-display text-lg font-bold uppercase text-white">{title}</h3>
        <p className="mt-2 text-sm text-text-muted">{text}</p>
      </div>
      <Link to={href} className="btn-hero-outline group mt-6 inline-flex w-fit text-sm">
        {label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
