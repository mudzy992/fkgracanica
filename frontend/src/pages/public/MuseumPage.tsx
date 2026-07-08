import { useMemo, useState } from 'react';
import { useMuseum } from '../../hooks';
import { PageContainer } from '../../components/public/PageContainer';
import { MuseumCinematicHero } from '../../components/public/museum/MuseumCinematicHero';
import { MuseumExhibitCard } from '../../components/public/museum/MuseumExhibitCard';
import { MuseumFilters } from '../../components/public/museum/MuseumFilters';
import { NewsSectionTitle } from '../../components/news/NewsSectionTitle';
import { Reveal } from '../../lib/motion/Reveal';
import { Seo } from '../../components/seo/Seo';
import { museumCategoryLabel } from '../../lib/museum-categories';
import { EmptyState } from '../../components/public/EmptyState';
import { Skeleton } from '../../components/ui/skeleton';

export function MuseumPage() {
  const { data, isLoading } = useMuseum();
  const [year, setYear] = useState<number | undefined>();
  const [category, setCategory] = useState<string | undefined>();

  const years = useMemo(() => {
    const set = new Set<number>();
    data?.forEach((i) => i.year != null && set.add(i.year));
    return [...set].sort((a, b) => b - a);
  }, [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((i) => i.category && set.add(i.category));
    return [...set].sort();
  }, [data]);

  const filtered = useMemo(
    () =>
      data?.filter((i) => {
        if (year != null && i.year !== year) return false;
        if (category && i.category !== category) return false;
        return true;
      }),
    [data, year, category],
  );

  return (
    <div className="pb-16 sm:pb-20">
      <Seo title="Muzej" description="Artefakti i historija FK Gračanica" />
      <MuseumCinematicHero
        totalCount={data?.length ?? 0}
        yearCount={years.length}
        categoryCount={categories.length}
      />
      <PageContainer className="py-10 sm:py-12">
        <MuseumFilters
          years={years}
          categories={categories}
          year={year}
          category={category}
          categoryLabel={museumCategoryLabel}
          onYear={setYear}
          onCategory={setCategory}
        />

        <div className="mt-10">
          <Reveal>
            <NewsSectionTitle>Zbirka</NewsSectionTitle>
          </Reveal>
          {!isLoading && (filtered?.length ?? 0) === 0 && (
            <EmptyState message="Nema predmeta u muzeju." />
          )}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))
              : filtered?.map((item, i) => (
                  <Reveal key={item.id} delay={Math.min(i * 0.05, 0.3)}>
                    <MuseumExhibitCard item={item} />
                  </Reveal>
                ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
