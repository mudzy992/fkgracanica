import { useTrophies } from '../../hooks';
import { splitFeaturedTrophy } from '../../lib/trophy-utils';
import { Seo } from '../../components/seo/Seo';
import { TrophyCard } from '../../components/public/trophies/TrophyCard';
import { TrophyFeaturedShowcase } from '../../components/public/trophies/TrophyFeaturedShowcase';
import { Skeleton } from '../../components/ui/skeleton';

export function TrophiesPage() {
  const { data, isLoading } = useTrophies();
  const { featured, rest } = splitFeaturedTrophy(data ?? []);

  return (
    <div className="pb-20">
      <Seo title="Trofeji" description="Trofeji i titule FK Gračanica" />
      <header className="border-b border-slate-200/80 bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center md:py-20">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">Ponos kluba</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-text md:text-5xl">Trofeji i titule</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Pregled najznačajnijih uspjeha kroz historiju kluba.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-12">
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
            <TrophyFeaturedShowcase trophy={featured} />
            {rest.length > 0 && (
              <section>
                <h2 className="mb-6 text-xl font-bold text-text">Ostali trofeji</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((t) => (
                    <TrophyCard key={t.id} trophy={t} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <p className="py-16 text-center text-text-muted">Nema trofeja.</p>
        )}
      </div>
    </div>
  );
}
