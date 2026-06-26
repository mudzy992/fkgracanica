import { Link, useParams } from 'react-router-dom';
import { useGalleryItem } from '../../hooks';
import { RichContent } from '../../components/public/RichContent';
import { PageContainer } from '../../components/public/PageContainer';
import { PhotoGridWithLightbox } from '../../components/public/PhotoGridWithLightbox';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export function GalleryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useGalleryItem(slug ?? '');

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-6xl" />;
  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Galerija nije pronađena.</p>;
  }

  return (
    <div className="pb-16">
      <Seo title={data.title} description={data.description ?? undefined} />
      <PageContainer className="py-10 sm:py-12">
        <Link to="/galerija">
          <Button variant="ghost" className="mb-4">
            ← Nazad
          </Button>
        </Link>
        <h1 className="font-display mb-2 text-3xl font-bold sm:text-4xl">{data.title}</h1>
        {data.description && <RichContent html={data.description} className="mb-8 text-text-muted" />}
        <PhotoGridWithLightbox photos={data.photos ?? []} columns="three" />
      </PageContainer>
    </div>
  );
}
