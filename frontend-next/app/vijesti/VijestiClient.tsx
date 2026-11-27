'use client';

import { useState } from 'react';
import { NewsCategoryFilter } from '../../components/news/NewsCategoryFilter';
import {
  NewsCompactCard,
  NewsFeaturedCard,
  NewsGridCard,
  type NewsItem,
} from '../../components/news/NewsCards';

type Category = { id: string; name: string; slug: string };

export function VijestiClient({
  initialNews,
  categories,
}: {
  initialNews: (NewsItem & { categoryId?: string | null })[];
  categories: Category[];
}) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  const items = activeId
    ? initialNews.filter((n) => n.categoryId === activeId)
    : initialNews;

  const filtered = Boolean(activeId);

  if (items.length === 0) {
    return (
      <>
        <NewsCategoryFilter
          categories={categories}
          activeId={activeId}
          onChange={setActiveId}
        />
        <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-muted">
          Nema vijesti u ovoj kategoriji.
        </div>
      </>
    );
  }

  return (
    <>
      <NewsCategoryFilter
        categories={categories}
        activeId={activeId}
        onChange={setActiveId}
      />
      {filtered ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsGridCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {items[0] ? <NewsFeaturedCard item={items[0]} /> : null}
            <div className="grid gap-6">
              {items.slice(1, 3).map((item) => (
                <NewsCompactCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          {items.length > 3 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.slice(3).map((item) => (
                <NewsGridCard key={item.id} item={item} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
