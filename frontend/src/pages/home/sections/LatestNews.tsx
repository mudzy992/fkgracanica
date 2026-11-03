import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublishedNews } from '../../../hooks';
import { stripHtml } from '../../../lib/html-content';
import { mediaUrl } from '../../../lib/media';
import { formatDate } from '../../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { SkeletonCard } from '../../../components/ui/skeleton';
import { Button } from '../../../components/ui/button';

export function LatestNews() {
  const { t } = useTranslation();
  const { data, isLoading } = usePublishedNews();
  const items = data?.slice(0, 3) ?? [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">{t('home.latestNews')}</h2>
        <Link to="/vijesti">
          <Button variant="ghost">{t('actions.viewAll')}</Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <Link key={item.id} to={`/vijesti/${item.slug}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                  {item.coverPath && (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={mediaUrl(item.coverPath, 'medium')}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-text-muted">
                      {stripHtml(item.excerpt ?? '')}
                    </p>
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
