import { useGalleryList } from '../../hooks';
import { EmptyState } from '../../components/public/EmptyState';
import { DataError } from '../../components/public/DataError';
import { PageContainer } from '../../components/public/PageContainer';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import {
  GalleryListBento,
  GalleryListBentoSkeleton,
} from '../../components/gallery/GalleryListBento';
import { Seo } from '../../components/seo/Seo';
import { useTranslation } from 'react-i18next';

export function GalleryListPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useGalleryList();

  return (
    <div className="pb-16">
      <Seo title={t('pages.gallery.seoTitle')} />
      <PageHeroHeader
        eyebrow={t('pages.gallery.eyebrow')}
        title={t('pages.gallery.title')}
        subtitle={t('pages.gallery.subtitle')}
      />
      <PageContainer className="py-10 sm:py-12">
        {isError ? (
          <DataError onRetry={() => void refetch()} />
        ) : isLoading ? (
          <GalleryListBentoSkeleton />
        ) : data?.length ? (
          <GalleryListBento items={data} />
        ) : (
          <EmptyState message={t('pages.gallery.empty')} />
        )}
      </PageContainer>
    </div>
  );
}
