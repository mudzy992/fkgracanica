import { useParams } from 'react-router-dom';
import { useGalleryItem } from '../../hooks';
import { RichContent } from '../../components/public/RichContent';
import { PageContainer } from '../../components/public/PageContainer';
import { DataError } from '../../components/public/DataError';
import { PremiumPhotoBento } from '../../components/public/PremiumPhotoBento';
import { GalleryAlbumHero } from '../../components/gallery/GalleryAlbumHero';
import { NewsSectionTitle } from '../../components/news/NewsSectionTitle';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';

export function GalleryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useGalleryItem(slug ?? '');
  const photos = data?.photos ?? [];
  const cover = photos[0]?.path;

  if (isLoading) {
    return (
      <div className="pb-16">
        <Skeleton className="h-[40vh] w-full rounded-none" />
        <Skeleton className="mx-auto mt-10 h-64 max-w-6xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pb-16">
        <PageContainer>
          <DataError onRetry={() => void refetch()} />
        </PageContainer>
      </div>
    );
  }

  if (!data) {
    return <p className="p-12 text-center text-text-muted">Galerija nije pronađena.</p>;
  }

  return (
    <div className="pb-16">
      <Seo title={data.title} description={data.description ?? undefined} />
      <GalleryAlbumHero title={data.title} coverPath={cover} photoCount={photos.length} />

      <PageContainer className="py-10 sm:py-12">
        {data.description && (
          <div className="glass-premium mb-10 rounded-2xl p-6 sm:p-8">
            <RichContent
              html={data.description}
              className="text-base leading-relaxed text-text-muted"
            />
          </div>
        )}

        {photos.length > 0 && (
          <section>
            <NewsSectionTitle>Fotografije</NewsSectionTitle>
            <PremiumPhotoBento photos={photos} />
          </section>
        )}
      </PageContainer>
    </div>
  );
}
