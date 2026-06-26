import { useTrophies } from '../../hooks';
import { splitFeaturedTrophy } from '../../lib/trophy-utils';
import { PageContainer } from '../../components/public/PageContainer';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { PublicSection } from '../../components/public/shell/PublicSection';
import { EmptyState } from '../../components/public/EmptyState';
import { Seo } from '../../components/seo/Seo';
import { TrophyCard } from '../../components/public/trophies/TrophyCard';
import { TrophyFeaturedShowcase } from '../../components/public/trophies/TrophyFeaturedShowcase';
import { Reveal } from '../../lib/motion/Reveal';
import { Skeleton } from '../../components/ui/skeleton';

export function TrophiesPage() {
  const { data, isLoading } = useTrophies();
  const { featured, rest } = splitFeaturedTrophy(data ?? []);

  return (
    <div className="pb-16 sm:pb-20">
      <Seo title="Trofeji" description="Trofeji i titule FK Gračanica" />
      <PageHeroHeader
        eyebrow="Ponos kluba"
        title="Trofeji i titule"
        subtitle="Pregled najznačajnijih uspjeha kroz historiju kluba."
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
              <PublicSection title="Ostali trofeji" className="pt-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((t, i) => (
                    <Reveal key={t.id} delay={i * 0.05}>
                      <TrophyCard trophy={t} />
                    </Reveal>
                  ))}
                </div>
              </PublicSection>
            )}
          </>
        ) : (
          <EmptyState message="Nema trofeja." />
        )}
      </PageContainer>
    </div>
  );
}
