import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { useSponsors } from '../../hooks';
import { SponsorHeroCard } from '../../components/public/sponsors/SponsorHeroCard';
import { SponsorMarqueeItem } from '../../components/public/sponsors/SponsorsMarquee';
import { WidgetSectionHeaderBlock } from '../../components/public/shell/WidgetSectionHeaderBlock';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import { Skeleton } from '../../components/ui/skeleton';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['sponsors'] };

export function SponsorsWidget({ config }: Props) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const { data, isLoading } = useSponsors();
  const items = (data ?? []).slice(0, config.limit);
  const title = config.title ?? t('home.sponsors');
  const viewAll = config.viewAllUrl ?? '/sponzori';
  const general = items.find((s) => s.tier === 'GENERAL');
  const rest = items.filter((s) => s.id !== general?.id);

  return (
    <WidgetSectionShell id="sponzori">
      <WidgetSectionHeaderBlock
        title={title}
        subtitle={t('home.sponsorsSubtitle', 'Partneri koji čine naš uspjeh mogućim')}
      />
      <div className="mb-8 flex justify-end">
        <Link to={viewAll} className="text-sm font-medium text-primary-light hover:underline">
          {t('actions.viewAll')}
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="mx-auto h-36 max-w-lg rounded-3xl" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ) : items.length ? (
        <div className="space-y-8">
          {general && (
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl"
            >
              <SponsorHeroCard sponsor={general} />
            </motion.div>
          )}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {rest.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SponsorMarqueeItem sponsor={s} className="glass-premium card-lift h-full w-full rounded-xl p-4" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-text-muted">Nema sponzora.</p>
      )}
    </WidgetSectionShell>
  );
}
