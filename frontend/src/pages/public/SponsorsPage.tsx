import { useMemo } from "react";
import { useSponsors } from "../../hooks";
import { groupSponsorsByTier } from "../../lib/sponsor-tiers";
import { SponsorsCinematicHero } from "../../components/public/sponsors/SponsorsCinematicHero";
import { SponsorsTierSection } from "../../components/public/sponsors/SponsorsTierSection";
import { EmptyState } from "../../components/public/EmptyState";
import { DataError } from "../../components/public/DataError";
import { Seo } from "../../components/seo/Seo";
import { Skeleton } from "../../components/ui/skeleton";

export function SponsorsPage() {
  const { data, isLoading, isError, refetch } = useSponsors();
  const sponsors = data ?? [];
  const groups = groupSponsorsByTier(sponsors);

  const stats = useMemo(() => {
    const premium = sponsors.filter((s) =>
      ["GENERAL", "GOLD", "SILVER"].includes(s.tier),
    ).length;
    const partner = sponsors.filter((s) =>
      ["BRONZE", "PARTNER"].includes(s.tier),
    ).length;
    return { total: sponsors.length, premium, partner };
  }, [sponsors]);

  return (
    <div className="pb-16 sm:pb-20">
      <Seo title="Sponzori" description="Partneri i sponzori FK Gračanica" />
      <SponsorsCinematicHero
        totalCount={stats.total}
        premiumCount={stats.premium}
        partnerCount={stats.partner}
      />
      {isError ? (
        <DataError onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="mx-auto max-w-6xl space-y-6 px-4 pt-10 sm:px-6 sm:pt-12">
          <Skeleton className="h-48 rounded-3xl sm:h-64" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ) : groups.length ? (
        <div className="space-y-10 pt-10 sm:space-y-14 sm:pt-12">
          {groups.map(({ tier, sponsors: tierSponsors }) => (
            <SponsorsTierSection
              key={tier}
              tier={tier}
              sponsors={tierSponsors}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="Nema sponzora." />
      )}
    </div>
  );
}
