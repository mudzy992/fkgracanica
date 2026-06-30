import { useMemo, useState } from 'react';
import { useHallOfFame } from '../../hooks';
import { mediaUrl } from '../../lib/media';
import { PageContainer } from '../../components/public/PageContainer';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Reveal } from '../../lib/motion/Reveal';
import { Seo } from '../../components/seo/Seo';
import { EmptyState } from '../../components/public/EmptyState';
import { Button } from '../../components/ui/button';

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
    <div className="pb-16">
      <Seo title="Hall of Fame" />
      <PageHeroHeader eyebrow="Legende" title="Hall of Fame" subtitle="Igrači i osobe koje su ostavile trag u historiji kluba." />
      <PageContainer className="py-10 sm:py-12">
        {years.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Button size="sm" variant={!year ? 'default' : 'ghost'} onClick={() => setYear(undefined)}>
              Sve
            </Button>
            {years.map((y) => (
              <Button key={y} size="sm" variant={year === y ? 'default' : 'ghost'} onClick={() => setYear(y)}>
                {y}
              </Button>
            ))}
          </div>
        )}
        {!isLoading && (filtered?.length ?? 0) === 0 && (
          <EmptyState message="Nema unosa u Hall of Fame." />
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-surface" />
              ))
            : filtered?.map((entry, i) => (
                <Reveal key={entry.id} delay={i * 0.05}>
                  <PremiumCard className="p-6 text-center">
                    {entry.photoPath || entry.imagePath ? (
                      <img
                        src={mediaUrl(entry.photoPath ?? entry.imagePath)}
                        alt=""
                        className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                        {entry.name[0]}
                      </div>
                    )}
                    <h2 className="font-display text-lg font-bold">{entry.name}</h2>
                    {entry.role && <p className="text-sm text-primary">{entry.role}</p>}
                    {entry.years && <p className="text-sm text-text-muted">{entry.years}</p>}
                    {entry.bio && <p className="mt-2 text-sm text-text-muted">{entry.bio}</p>}
                  </PremiumCard>
                </Reveal>
              ))}
        </div>
      </PageContainer>
    </div>
  );
}
