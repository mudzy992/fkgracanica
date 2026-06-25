import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNewsCategories, usePublishedNews } from '../../hooks';
import { asArray } from '../../lib/as-array';
import type { NewsCategory } from '../../hooks/use-news-admin';
import type { NewsItem } from '../../types';
import { stripHtml } from '../../lib/html-content';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { SkeletonCard } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export function NewsListPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const { data: categoriesRaw } = useNewsCategories();
  const categories = asArray<NewsCategory>(categoriesRaw);
  const { data, isLoading } = usePublishedNews(categoryId);
  const items = asArray<NewsItem>(data);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Vijesti" />
      <h1 className="mb-6 text-3xl font-bold">Vijesti</h1>
      {categories && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={!categoryId ? 'default' : 'ghost'}
            onClick={() => setCategoryId(undefined)}
          >
            Sve
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={categoryId === cat.id ? 'default' : 'ghost'}
              onClick={() => setCategoryId(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <Link key={item.id} to={`/vijesti/${item.slug}`}>
                <Card className="h-full overflow-hidden hover:shadow-md">
                  {item.coverPath && (
                    <img src={mediaUrl(item.coverPath)} alt="" className="h-44 w-full object-cover" />
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-text-muted">
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
    </div>
  );
}
