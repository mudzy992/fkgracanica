import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Landmark } from 'lucide-react';
import { useHallOfFame } from '../../hooks';
import { PageContainer } from '../../components/public/PageContainer';
import { HallOfFameCinematicHero } from '../../components/public/hall-of-fame/HallOfFameCinematicHero';
import { HofLegendCard } from '../../components/public/hall-of-fame/HofLegendCard';
import { HofLegendDialog } from '../../components/public/hall-of-fame/HofLegendDialog';
import { Reveal } from '../../lib/motion/Reveal';
import { Seo } from '../../components/seo/Seo';
import { EmptyState } from '../../components/public/EmptyState';
import { DataError } from '../../components/common/DataError';
import { Skeleton } from '../../components/ui/skeleton';
import type { HallOfFameEntry } from '../../types';
import { useTranslation } from 'react-i18next';

function extractYears(years?: string | null): string[] {
  if (!years) return [];
  return years.match(/\d{4}/g) ?? [];
}

function groupHofByYear(
  entries: HallOfFameEntry[],
): { year: string; entries: HallOfFameEntry[] }[] {
  const map = new Map<string, HallOfFameEntry[]>();
  for (const entry of entries) {
    const year = extractYears(entry.years)[0] ?? '';
    const bucket = map.get(year) ?? [];
    bucket.push(entry);
    map.set(year, bucket);
  }
  return [...map.entries()]
    .map(([year, groupEntries]) => ({
      year,
      entries: [...groupEntries].sort((a, b) => a.name.localeCompare(b.name, 'bs')),
    }))
    .sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0) || b.year.localeCompare(a.year));
}

export function HallOfFamePage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useHallOfFame();
  const [activeEntry, setActiveEntry] = useState<HallOfFameEntry | null>(null);

  const yearCount = useMemo(() => groupHofByYear(data ?? []).length, [data]);
  const sections = useMemo(() => groupHofByYear(data ?? []), [data]);

  return (
    <div className="overflow-hidden bg-[linear-gradient(180deg,#030712_0%,#0b1220_42%,#161006_100%)] pb-16 sm:pb-20">
      <Seo title={t('pages.hallOfFame.seoTitle')} description={t('pages.hallOfFame.seoDesc')} />
      <HallOfFameCinematicHero totalCount={data?.length ?? 0} yearCount={yearCount} />
      <PageContainer className="py-10 sm:py-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-100">
              <Landmark className="h-3.5 w-3.5" />
              Ekskluzivno poglavlje
            </div>
            <Link
              to="/o-klubu"
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-amber-300/30 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Nazad na O klubu
            </Link>
          </div>
        </div>

        {isError ? (
          <DataError onRetry={() => void refetch()} />
        ) : (
          <>
            {!isLoading && sections.length === 0 && (
              <EmptyState message={t('pages.hallOfFame.empty')} />
            )}
          </>
        )}
        {isError ? null : isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-[1.75rem] bg-white/10" />
            ))}
          </div>
        ) : (
          sections.map((section) => (
            <section key={section.year} className="mt-10 first:mt-8">
              <h2 className="font-display text-3xl font-bold tracking-tight text-amber-100 sm:text-4xl">
                {section.year}
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {section.entries.map((entry, i) => (
                  <Reveal key={entry.id} delay={Math.min(i * 0.05, 0.3)}>
                    <HofLegendCard entry={entry} onOpen={setActiveEntry} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))
        )}
        <div className="mt-10 rounded-[2rem] border border-amber-300/15 bg-[linear-gradient(180deg,rgba(245,158,11,0.12),rgba(15,23,42,0.25))] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100">
            Završna nota
          </p>
          <p className="font-display mt-3 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Kuća slavnih nije samo lista imena, već prostor u kojem klub čuva svoju mjeru veličine.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Svaka karta ovdje predstavlja lice iza jednog razdoblja, jedne pobjede, jedne tribine i
            jednog osjećaja pripadnosti koji traje mnogo duže od jedne sezone.
          </p>
        </div>
        <HofLegendDialog
          entry={activeEntry}
          open={Boolean(activeEntry)}
          onClose={() => setActiveEntry(null)}
        />
      </PageContainer>
    </div>
  );
}
