import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { HomeNextMatchTicketsBanner } from '../../components/ticketing/HomeNextMatchTicketsBanner';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['tickets-cta'] };

export function TicketsCtaWidget({ config }: Props) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const mode = config.mode ?? 'manual';

  if (mode === 'auto') {
    return (
      <HomeNextMatchTicketsBanner
        title={config.title ?? t('home.tickets')}
        text={config.text}
        buttonLabel={config.buttonLabel ?? t('home.tickets')}
      />
    );
  }

  const title = config.title ?? t('home.tickets');
  const text = config.text ?? t('home.ticketsDesc');
  const btnLabel = config.buttonLabel ?? t('home.tickets');
  const btnUrl = config.buttonUrl ?? '/ulaznice';

  return (
    <WidgetSectionShell>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-premium-blue card-lift flex flex-col items-start gap-6 rounded-3xl p-8 sm:p-10 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 className="font-display text-2xl font-bold uppercase text-white sm:text-3xl">{title}</h2>
          <p className="mt-3 max-w-lg text-text-muted">{text}</p>
        </div>
        <Link to={btnUrl} className="btn-hero-primary group inline-flex shrink-0">
          {btnLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </WidgetSectionShell>
  );
}
