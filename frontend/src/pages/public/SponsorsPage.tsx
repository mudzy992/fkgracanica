import { useSponsors } from '../../hooks';
import { groupSponsorsByTier } from '../../lib/sponsor-tiers';
import { Seo } from '../../components/seo/Seo';
import { SponsorsTierSection } from '../../components/public/sponsors/SponsorsTierSection';
import { Skeleton } from '../../components/ui/skeleton';

export function SponsorsPage() {
  const { data, isLoading } = useSponsors();
  const groups = groupSponsorsByTier(data ?? []);
  const hero = groups.find((g) => g.tier === 'GENERAL');
  const rest = groups.filter((g) => g.tier !== 'GENERAL');

  return (
    <div className="pb-20">
      <Seo title="Sponzori" description="Partneri i sponzori FK Gračanica" />
      <header className="border-b border-slate-200/80 bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center md:py-20">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">Zahvalnost</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-text md:text-5xl">Naši sponzori</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Zahvaljujemo se partnerima koji podržavaju razvoj kluba, omladinskih kategorija i zajednice.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="mx-auto max-w-6xl space-y-8 px-4 pt-12">
          <Skeleton className="h-64 rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        </div>
      ) : groups.length ? (
        <>
          {hero && (
            <div className="mt-12">
              <SponsorsTierSection tier={hero.tier} sponsors={hero.sponsors} />
            </div>
          )}
          {rest.length > 0 && (
            <div className="mx-auto max-w-6xl space-y-14 px-4 pt-12">
              {rest.map(({ tier, sponsors }) => (
                <SponsorsTierSection key={tier} tier={tier} sponsors={sponsors} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="py-16 text-center text-text-muted">Nema sponzora.</p>
      )}
    </div>
  );
}
