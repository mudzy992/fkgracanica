import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrophies } from '../../hooks';
import { splitFeaturedTrophy } from '../../lib/trophy-utils';
import { TrophyCard } from '../../components/public/trophies/TrophyCard';
import { TrophyFeaturedShowcase } from '../../components/public/trophies/TrophyFeaturedShowcase';
import { WidgetSectionHeaderBlock } from '../../components/public/shell/WidgetSectionHeaderBlock';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
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
    <WidgetSectionShell id="trofeji">
      <WidgetSectionHeaderBlock title={title} subtitle={t('home.trophiesSubtitle', 'Ponos kluba')} eyebrow="Ponos kluba" />
      <div className="mb-8 flex justify-end">
        <Link to={viewAll} className="text-sm font-medium text-primary-light hover:underline">
          {t('actions.viewAll')}
        </Link>
      </div>

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
    </WidgetSectionShell>
  );
}
