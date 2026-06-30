import { useMemo } from 'react';
import { useTrophies } from '../../hooks';
import { splitFeaturedTrophy } from '../../lib/trophy-utils';
import { PageContainer } from '../../components/public/PageContainer';
import { TrophiesCinematicHero } from '../../components/public/trophies/TrophiesCinematicHero';
import { EmptyState } from '../../components/public/EmptyState';
import { Seo } from '../../components/seo/Seo';
import { TrophyCard } from '../../components/public/trophies/TrophyCard';
import { TrophyFeaturedShowcase } from '../../components/public/trophies/TrophyFeaturedShowcase';
import { NewsSectionTitle } from '../../components/news/NewsSectionTitle';
import { Reveal } from '../../lib/motion/Reveal';
import { Skeleton } from '../../components/ui/skeleton';

export function TrophiesPage() {
  const { data, isLoading } = useTrophies();
  const trophies = data ?? [];
  const { featured, rest } = splitFeaturedTrophy(trophies);

  const stats = useMemo(() => {
    const competitions = new Set(trophies.map((t) => t.competition).filter(Boolean));
    return { total: trophies.length, competitionCount: competitions.size };
  }, [trophies]);

  return (
    <div className="pb-16 sm:pb-20">
      <Seo title="Trofeji" description="Trofeji i titule FK Gračanica" />
      <TrophiesCinematicHero
        totalCount={stats.total}
        featuredYear={featured?.year}
        competitionCount={stats.competitionCount}
      />
      <PageContainer className="py-10 sm:py-12">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-72 rounded-3xl" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          </div>
        ) : featured ? (
          <>
            <Reveal>
              <TrophyFeaturedShowcase trophy={featured} />
            </Reveal>
            {rest.length > 0 && (
              <section className="pt-10 sm:pt-12">
                <Reveal>
                  <NewsSectionTitle>Ostali trofeji</NewsSectionTitle>
                </Reveal>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((t, i) => (
                    <Reveal key={t.id} delay={i * 0.05}>
                      <TrophyCard trophy={t} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <EmptyState message="Nema trofeja." />
        )}
      </PageContainer>
    </div>
  );
}
