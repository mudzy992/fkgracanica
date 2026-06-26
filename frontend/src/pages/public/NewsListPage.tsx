import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNewsCategories, usePublishedNews } from '../../hooks';
import { asArray } from '../../lib/as-array';
import type { NewsCategory } from '../../hooks/use-news-admin';
import type { NewsItem } from '../../types';
import { stripHtml } from '../../lib/html-content';
import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';
import { EmptyState } from '../../components/public/EmptyState';
import { PageContainer } from '../../components/public/PageContainer';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Reveal } from '../../lib/motion/Reveal';
import { Seo } from '../../components/seo/Seo';
import { SkeletonCard } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export function NewsListPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const { data: categoriesRaw } = useNewsCategories();
  const categories = asArray<NewsCategory>(categoriesRaw);
  const { data, isLoading } = usePublishedNews(categoryId);
  const items = asArray<NewsItem>(data);

  return (
    <div className="pb-16">
      <Seo title="Vijesti" />
      <PageHeroHeader eyebrow="Mediji" title="Vijesti" subtitle="Najnovije vijesti iz kluba i sa terena." />
      <PageContainer className="py-10 sm:py-12">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Button size="sm" variant={!categoryId ? 'default' : 'ghost'} onClick={() => setCategoryId(undefined)}>
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.05}>
                  <Link to={`/vijesti/${item.slug}`} className="group block h-full">
                    <PremiumCard className="h-full overflow-hidden p-0">
                      {item.coverPath && (
                        <img
                          src={mediaUrl(item.coverPath)}
                          alt=""
                          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="p-4">
                        <h2 className="font-display line-clamp-2 text-lg font-semibold">{item.title}</h2>
                        <p className="mt-2 line-clamp-3 text-sm text-text-muted">{stripHtml(item.excerpt ?? '')}</p>
                        <p className="mt-2 text-xs text-text-muted">
                          {item.publishedAt ? formatDate(item.publishedAt) : ''}
                        </p>
                      </div>
                    </PremiumCard>
                  </Link>
                </Reveal>
              ))}
        </div>
        {!isLoading && items.length === 0 && <EmptyState message="Nema objavljenih vijesti." />}
      </PageContainer>
    </div>
  );
}
