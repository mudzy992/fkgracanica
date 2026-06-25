import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublishedNews } from '../../hooks';
import { stripHtml } from '../../lib/html-content';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { SkeletonCard } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['news-feed'] };

export function NewsFeedWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = usePublishedNews(config.categoryId);
  const items = (data ?? []).slice(0, config.limit);
  const title = config.title ?? t('home.latestNews');
  const viewAll = config.viewAllUrl ?? '/vijesti';
  const viewAllLabel = config.viewAllLabel ?? t('actions.viewAll');

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">{title}</h2>
        <Link to={viewAll}>
          <Button variant="ghost">{viewAllLabel}</Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: config.limit }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <Link key={item.id} to={`/vijesti/${item.slug}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                  {item.coverPath && (
                    <img src={mediaUrl(item.coverPath, 'medium')} alt="" className="h-40 w-full object-cover" />
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-text-muted">{stripHtml(item.excerpt ?? '')}</p>
                    <p className="mt-2 text-xs text-text-muted">
                      {item.publishedAt ? formatDate(item.publishedAt) : ''}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </section>
  );
}
