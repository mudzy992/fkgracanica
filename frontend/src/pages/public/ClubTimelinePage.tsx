import { useClubTimeline, useOwnClub } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { ClubProfileHero } from '../../components/public/clubs/ClubProfileHero';
import { ClubTimelineRail } from '../../components/public/timeline/ClubTimelineRail';
import { Skeleton } from '../../components/ui/skeleton';

export function ClubTimelinePage() {
  const { data: ownClub, isLoading: clubLoading } = useOwnClub();
  const { data, isLoading } = useClubTimeline();

  return (
    <div className="pb-20">
      <Seo title="O klubu" description={ownClub?.description ?? 'Historija i razvoj FK Gračanica'} />
      <ClubProfileHero
        club={ownClub}
        isLoading={clubLoading}
        eyebrow="Naša priča"
        title="O klubu"
        subtitle="Od osnivanja do današnjih dana — ključni trenuci u historiji kluba."
      />

      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : data?.length ? (
          <ClubTimelineRail events={data} />
        ) : (
          <p className="py-16 text-center text-text-muted">Historija kluba još nije objavljena.</p>
        )}
      </div>
    </div>
  );
}
