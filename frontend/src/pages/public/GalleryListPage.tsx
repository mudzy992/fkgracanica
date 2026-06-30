import { useGalleryList } from '../../hooks';
import { EmptyState } from '../../components/public/EmptyState';
import { PageContainer } from '../../components/public/PageContainer';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { GalleryListBento, GalleryListBentoSkeleton } from '../../components/gallery/GalleryListBento';
import { Seo } from '../../components/seo/Seo';

export function GalleryListPage() {
  const { data, isLoading } = useGalleryList();

  return (
    <div className="pb-16">
      <Seo title="Galerija" />
      <PageHeroHeader eyebrow="Mediji" title="Galerija" subtitle="Fotografije s utakmica, događaja i iza kulisa." />
      <PageContainer className="py-10 sm:py-12">
        {isLoading ? (
          <GalleryListBentoSkeleton />
        ) : data?.length ? (
          <GalleryListBento items={data} />
        ) : (
          <EmptyState message="Nema objavljenih galerija." />
        )}
      </PageContainer>
    </div>
  );
}
