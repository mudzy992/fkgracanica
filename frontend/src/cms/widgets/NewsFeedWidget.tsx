import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublishedNews } from '../../hooks';
import { stripHtml } from '../../lib/html-content';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';
import { Reveal } from '../../lib/motion/Reveal';
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
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-text">{title}</h2>
        <Link to={viewAll}>
          <Button variant="ghost">{viewAllLabel}</Button>
        </Link>
      </Reveal>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: config.limit }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.08}>
                <Link to={`/vijesti/${item.slug}`} className="group block h-full">
                  <Card className="glass-card h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-premium">
                    {item.coverPath && (
                      <div className="overflow-hidden">
                        <img
                          src={mediaUrl(item.coverPath, 'medium')}
                          alt=""
                          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
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
              </Reveal>
            ))}
      </div>
    </section>
  );
}
