import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublishedNews } from '../../hooks';
import { WidgetSectionHeaderBlock } from '../../components/public/shell/WidgetSectionHeaderBlock';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import { SkeletonCard } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { NewsCompactCard, NewsFeaturedCard, NewsGridCard } from './news-feed-cards';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['news-feed'] };

export function NewsFeedWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = usePublishedNews(config.categoryId);
  const items = (data ?? []).slice(0, config.limit);
  const title = config.title ?? t('home.latestNews');
  const viewAll = config.viewAllUrl ?? '/vijesti';
  const viewAllLabel = config.viewAllLabel ?? t('actions.viewAll');
  const [featured, ...rest] = items;

  return (
    <WidgetSectionShell id="vijesti">
      <WidgetSectionHeaderBlock title={title} subtitle={t('home.latestNewsSubtitle', 'Najnovije iz kluba')} />
      <div className="mb-6 flex justify-end">
        <Link to={viewAll}>
          <Button variant="ghost" className="text-primary-light hover:text-white">
            {viewAllLabel}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: Math.min(config.limit, 3) }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-text-muted">{t('common.noResults')}</p>
      ) : (
        <>
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {featured && <NewsFeaturedCard item={featured} />}
            {rest.slice(0, 2).map((item, i) => (
              <NewsCompactCard key={item.id} item={item} delay={i * 0.1} />
            ))}
          </div>
          {rest.length > 2 && (
            <div className="grid gap-6 md:grid-cols-3">
              {rest.slice(2).map((item, i) => (
                <NewsGridCard key={item.id} item={item} delay={i * 0.1} />
              ))}
            </div>
          )}
        </>
      )}
    </WidgetSectionShell>
  );
}
