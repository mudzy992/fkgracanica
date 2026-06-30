import { useState } from 'react';
import { useNewsCategories, usePublishedNews } from '../../hooks';
import { asArray } from '../../lib/as-array';
import type { NewsCategory } from '../../hooks/use-news-admin';
import type { NewsItem } from '../../types';
import { EmptyState } from '../../components/public/EmptyState';
import { PageContainer } from '../../components/public/PageContainer';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';
import { SkeletonCard } from '../../components/ui/skeleton';
import { NewsCategoryFilter } from '../../components/news/NewsCategoryFilter';
import { NewsCompactCard, NewsFeaturedCard, NewsGridCard } from '../../cms/widgets/news-feed-cards';

function NewsFeedLayout({ items }: { items: NewsItem[] }) {
  const [featured, ...rest] = items;

  return (
    <>
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {featured && <NewsFeaturedCard item={featured} />}
        {rest.slice(0, 2).map((item, i) => (
          <NewsCompactCard key={item.id} item={item} delay={i * 0.1} />
        ))}
      </div>
      {rest.length > 2 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.slice(2).map((item, i) => (
            <NewsGridCard key={item.id} item={item} delay={i * 0.1} />
          ))}
        </div>
      )}
    </>
  );
}

function NewsGridLayout({ items }: { items: NewsItem[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <NewsGridCard key={item.id} item={item} delay={i * 0.05} />
      ))}
    </div>
  );
}

export function NewsListPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const { data: categoriesRaw } = useNewsCategories();
  const categories = asArray<NewsCategory>(categoriesRaw);
  const { data, isLoading } = usePublishedNews(categoryId);
  const items = asArray<NewsItem>(data);
  const filtered = Boolean(categoryId);

  return (
    <div className="pb-16">
      <Seo title="Vijesti" />
      <PageHeroHeader eyebrow="Mediji" title="Vijesti" subtitle="Najnovije vijesti iz kluba i sa terena." />
      <PageContainer className="py-10 sm:py-12">
        <NewsCategoryFilter categories={categories} activeId={categoryId} onChange={setCategoryId} />

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState message="Nema objavljenih vijesti." />
        ) : filtered ? (
          <NewsGridLayout items={items} />
        ) : (
          <NewsFeedLayout items={items} />
        )}
      </PageContainer>
    </div>
  );
}
