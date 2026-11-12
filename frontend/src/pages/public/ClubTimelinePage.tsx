import { useMemo } from 'react';
import { useClubTimeline, useHallOfFame, useOwnClub } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { EmptyState } from '../../components/public/EmptyState';
import { ClubStoryColdOpen } from '../../components/public/story/ClubStoryColdOpen';
import { ClubStoryFilm } from '../../components/public/story/ClubStoryFilm';
import { ClubStoryCoda } from '../../components/public/story/ClubStoryCoda';
import { sortStoryChapters } from '../../components/public/story/sort-story-chapters';
import { Skeleton } from '../../components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export function ClubTimelinePage() {
  const { t } = useTranslation();
  const { data: ownClub, isLoading: clubLoading } = useOwnClub();
  const { data, isLoading } = useClubTimeline();
  const { data: hallOfFame } = useHallOfFame();
  const chapters = useMemo(() => sortStoryChapters(data ?? []), [data]);
  const seoDescription = ownClub?.description ?? t('pages.club.timelineSeoDesc');
  const storyImages = useMemo(
    () =>
      chapters
        .map((chapter) => chapter.imagePath)
        .filter((image): image is string => Boolean(image))
        .slice(0, 2),
    [chapters],
  );
  const heritageImage =
    hallOfFame?.find((entry) => entry.photoPath || entry.imagePath)?.photoPath ??
    hallOfFame?.find((entry) => entry.photoPath || entry.imagePath)?.imagePath;

  if (isLoading || clubLoading) {
    return (
      <>
        <Seo title={t('pages.club.aboutClub')} description={seoDescription} />
        <Skeleton className="-mt-16 h-dvh w-full rounded-none bg-primary/20" />
      </>
    );
  }

  if (!chapters.length) {
    return (
      <>
        <Seo title={t('pages.club.aboutClub')} description={seoDescription} />
        <ClubStoryColdOpen club={ownClub} />
        <EmptyState message={t('pages.club.timelineEmpty')} />
      </>
    );
  }

  return (
    <>
      <Seo title={t('pages.club.aboutClub')} description={seoDescription} />
      <ClubStoryColdOpen club={ownClub} firstYear={chapters[0].year} />
      <ClubStoryFilm events={chapters} />
      <ClubStoryCoda storyImages={storyImages} heritageImage={heritageImage} />
    </>
  );
}
