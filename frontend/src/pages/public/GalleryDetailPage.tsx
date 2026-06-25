import { Link, useParams } from 'react-router-dom';
import { useGalleryItem } from '../../hooks';
import { RichContent } from '../../components/public/RichContent';
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

  const photos = data.photos ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title={data.title} description={data.description ?? undefined} />
      <Link to="/galerija">
        <Button variant="ghost" className="mb-4">
          ← Nazad
        </Button>
      </Link>
      <h1 className="mb-2 text-3xl font-bold">{data.title}</h1>
      {data.description && <RichContent html={data.description} className="mb-8 text-text-muted" />}
      <PhotoGridWithLightbox photos={photos} columns="three" />
    </div>
  );
}
