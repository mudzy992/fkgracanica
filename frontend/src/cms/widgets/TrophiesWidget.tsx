import { Link } from 'react-router-dom';
import { Reveal } from '../../lib/motion/Reveal';
import { useTranslation } from 'react-i18next';
import { useTrophies } from '../../hooks';
import { splitFeaturedTrophy } from '../../lib/trophy-utils';
import { TrophyCard } from '../../components/public/trophies/TrophyCard';
import { TrophyFeaturedShowcase } from '../../components/public/trophies/TrophyFeaturedShowcase';
import { Skeleton } from '../../components/ui/skeleton';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['trophies'] };

export function TrophiesWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useTrophies();
  const { featured, rest } = splitFeaturedTrophy(data ?? []);
  const items = rest.slice(0, Math.max(0, config.limit - 1));
  const title = config.title ?? t('home.trophies');
  const viewAll = config.viewAllUrl ?? '/trofeji';

  return (
    <section className="border-y border-slate-200/60 bg-gradient-to-b from-background via-surface/40 to-background py-14 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Ponos kluba</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-text md:text-3xl">{title}</h2>
          </div>
          <Link to={viewAll} className="shrink-0 text-sm font-medium text-accent hover:underline">
            {t('actions.viewAll')}
          </Link>
        </Reveal>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-3xl" />
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        ) : featured ? (
          <div className="space-y-8">
            <TrophyFeaturedShowcase trophy={featured} compact />
            {items.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {items.map((tr) => (
                  <TrophyCard key={tr.id} trophy={tr} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-text-muted">Nema trofeja.</p>
        )}
      </div>
    </section>
  );
}
