import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['membership-cta'] };

export function MembershipCtaWidget({ config }: Props) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const title = config.title ?? t('home.membership');
  const text = config.text ?? t('home.membershipDesc');
  const btnLabel = config.buttonLabel ?? t('home.membership');
  const btnUrl = config.buttonUrl ?? '/clanstvo';

  return (
    <WidgetSectionShell>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="border-gradient-club relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-8 sm:p-12"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase text-white sm:text-3xl">{title}</h2>
            <p className="mt-3 max-w-lg text-white/80">{text}</p>
          </div>
          <Link to={btnUrl} className="btn-hero-primary group inline-flex">
            {btnLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>
    </WidgetSectionShell>
  );
}
