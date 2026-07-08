import { useMemo, useState } from 'react';
import { useHallOfFame } from '../../hooks';
import { PageContainer } from '../../components/public/PageContainer';
import { HallOfFameCinematicHero } from '../../components/public/hall-of-fame/HallOfFameCinematicHero';
import { HofLegendCard } from '../../components/public/hall-of-fame/HofLegendCard';
import { NewsSectionTitle } from '../../components/news/NewsSectionTitle';
import { Reveal } from '../../lib/motion/Reveal';
import { Seo } from '../../components/seo/Seo';
import { EmptyState } from '../../components/public/EmptyState';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

function extractYears(years?: string | null): string[] {
  if (!years) return [];
  return years.match(/\d{4}/g) ?? [];
}

export function HallOfFamePage() {
  const { data, isLoading } = useHallOfFame();
  const [year, setYear] = useState<string | undefined>();

  const years = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((e) => extractYears(e.years).forEach((y) => set.add(y)));
    return [...set].sort((a, b) => Number(b) - Number(a));
  }, [data]);

  const filtered = useMemo(() => {
    if (!year) return data;
    return data?.filter((e) => extractYears(e.years).includes(year));
  }, [data, year]);

  return (
    <div className="pb-16 sm:pb-20">
      <Seo title="Hall of Fame" description="Legende FK Gračanica" />
      <HallOfFameCinematicHero totalCount={data?.length ?? 0} yearCount={years.length} />
      <PageContainer className="py-10 sm:py-12">
        {years.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Button size="sm" variant={!year ? 'default' : 'outline'} onClick={() => setYear(undefined)}>
              Sve
            </Button>
            {years.map((y) => (
              <Button
                key={y}
                size="sm"
                variant={year === y ? 'default' : 'outline'}
                onClick={() => setYear(y)}
              >
                {y}
              </Button>
            ))}
          </div>
        )}

        <Reveal>
          <NewsSectionTitle>Legende</NewsSectionTitle>
        </Reveal>
        {!isLoading && (filtered?.length ?? 0) === 0 && (
          <EmptyState message="Nema unosa u Hall of Fame." />
        )}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))
            : filtered?.map((entry, i) => (
                <Reveal key={entry.id} delay={Math.min(i * 0.05, 0.3)}>
                  <HofLegendCard entry={entry} />
                </Reveal>
              ))}
        </div>
      </PageContainer>
    </div>
  );
}
