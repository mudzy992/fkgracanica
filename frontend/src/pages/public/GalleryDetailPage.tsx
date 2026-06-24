import { Link, useParams } from 'react-router-dom';
import { useGalleryItem } from '../../hooks';
import { mediaUrl } from '../../lib/media';
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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title={data.title} description={data.description ?? undefined} />
      <Link to="/galerija">
        <Button variant="ghost" className="mb-4">
          ← Nazad
        </Button>
      </Link>
      <h1 className="mb-2 text-3xl font-bold">{data.title}</h1>
      {data.description && <p className="mb-8 text-text-muted">{data.description}</p>}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {data.photos?.map((photo) => (
          <figure key={photo.id} className="overflow-hidden rounded-lg">
            <img src={mediaUrl(photo.path)} alt={photo.caption ?? ''} className="w-full object-cover" />
            {photo.caption && (
              <figcaption className="p-2 text-sm text-text-muted">{photo.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
