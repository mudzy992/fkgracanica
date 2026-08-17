import { useMemo } from 'react';
import { useClubTimeline, useOwnClub } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { EmptyState } from '../../components/public/EmptyState';
import { ClubStoryColdOpen } from '../../components/public/story/ClubStoryColdOpen';
import { ClubStoryFilm } from '../../components/public/story/ClubStoryFilm';
import { ClubStoryCoda } from '../../components/public/story/ClubStoryCoda';
import { sortStoryChapters } from '../../components/public/story/sort-story-chapters';
import { Skeleton } from '../../components/ui/skeleton';

export function ClubTimelinePage() {
  const { data: ownClub, isLoading: clubLoading } = useOwnClub();
  const { data, isLoading } = useClubTimeline();
  const chapters = useMemo(() => sortStoryChapters(data ?? []), [data]);
  const seoDescription = ownClub?.description ?? 'Historija i razvoj FK Gračanica';

  if (isLoading || clubLoading) {
    return (
      <>
        <Seo title="O klubu" description={seoDescription} />
        <Skeleton className="-mt-16 h-dvh w-full rounded-none bg-primary/20" />
      </>
    );
  }

  if (!chapters.length) {
    return (
      <>
        <Seo title="O klubu" description={seoDescription} />
        <ClubStoryColdOpen club={ownClub} />
        <EmptyState message="Historija kluba još nije objavljena." />
      </>
    );
  }

  return (
    <>
      <Seo title="O klubu" description={seoDescription} />
      <ClubStoryColdOpen club={ownClub} firstYear={chapters[0].year} />
      <ClubStoryFilm events={chapters} />
      <ClubStoryCoda />
    </>
  );
}
