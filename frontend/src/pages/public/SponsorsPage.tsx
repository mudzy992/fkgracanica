import { useSponsors } from '../../hooks';
import { groupSponsorsByTier } from '../../lib/sponsor-tiers';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';
import { SponsorsTierSection } from '../../components/public/sponsors/SponsorsTierSection';
import { EmptyState } from '../../components/public/EmptyState';
import { Skeleton } from '../../components/ui/skeleton';

export function SponsorsPage() {
  const { data, isLoading } = useSponsors();
  const groups = groupSponsorsByTier(data ?? []);
  const hero = groups.find((g) => g.tier === 'GENERAL');
  const rest = groups.filter((g) => g.tier !== 'GENERAL');

  return (
    <div className="pb-16 sm:pb-20">
      <Seo title="Sponzori" description="Partneri i sponzori FK Gračanica" />
      <PageHeroHeader
        eyebrow="Zahvalnost"
        title="Naši sponzori"
        subtitle="Zahvaljujemo se partnerima koji podržavaju razvoj kluba, omladinskih kategorija i zajednice."
      />
      {isLoading ? (
        <div className="mx-auto max-w-6xl space-y-6 px-4 pt-8 sm:px-6 sm:pt-12">
          <Skeleton className="h-48 rounded-2xl sm:h-64" />
        </div>
      ) : groups.length ? (
        <div className="space-y-10 pt-8 sm:space-y-14 sm:pt-12">
          {hero && <SponsorsTierSection tier={hero.tier} sponsors={hero.sponsors} />}
          {rest.length > 0 && (
            <div className="mx-auto max-w-6xl space-y-10 px-4 sm:space-y-14 sm:px-6">
              {rest.map(({ tier, sponsors }) => (
                <SponsorsTierSection key={tier} tier={tier} sponsors={sponsors} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyState message="Nema sponzora." />
      )}
    </div>
  );
}
