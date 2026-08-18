import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Landmark } from 'lucide-react';
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
    <div className="overflow-hidden bg-[linear-gradient(180deg,#030712_0%,#0b1220_42%,#161006_100%)] pb-16 sm:pb-20">
      <Seo title="Kuća slavnih" description="Legende FK Gračanica" />
      <HallOfFameCinematicHero totalCount={data?.length ?? 0} yearCount={years.length} />
      <PageContainer className="py-10 sm:py-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-100">
                <Landmark className="h-3.5 w-3.5" />
                Ekskluzivno poglavlje
              </div>
              <div className="mt-4">
                <Reveal>
                  <NewsSectionTitle>Legende</NewsSectionTitle>
                </Reveal>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Ovo poglavlje otvara se tek nakon priče o klubu i sabira ljude koji su ostavili najdublji trag.
              </p>
            </div>
            <Link
              to="/o-klubu"
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-amber-300/30 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Nazad na O klubu
            </Link>
          </div>
          {years.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="sm" variant={!year ? 'default' : 'outline'} onClick={() => setYear(undefined)}>
                Sve ere
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
        </div>

        {!isLoading && (filtered?.length ?? 0) === 0 && <EmptyState message="Nema unosa u Kući slavnih." />}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-[1.75rem] bg-white/10" />
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
