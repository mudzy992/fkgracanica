import { Link } from 'react-router-dom';
import { usePublishedNews } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { SkeletonCard } from '../../components/ui/skeleton';

export function NewsListPage() {
  const { data, isLoading } = usePublishedNews();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Vijesti" />
      <h1 className="mb-8 text-3xl font-bold">Vijesti</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : data?.map((item) => (
              <Link key={item.id} to={`/vijesti/${item.slug}`}>
                <Card className="h-full overflow-hidden hover:shadow-md">
                  {item.coverPath && (
                    <img src={mediaUrl(item.coverPath)} alt="" className="h-44 w-full object-cover" />
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-text-muted">{item.excerpt}</p>
                    <p className="mt-2 text-xs text-text-muted">
                      {item.publishedAt ? formatDate(item.publishedAt) : ''}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  );
}
