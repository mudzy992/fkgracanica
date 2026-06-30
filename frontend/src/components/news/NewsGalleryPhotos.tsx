import type { GalleryItem } from '../../types';
import { useGalleryDetail } from '../../hooks/use-content-admin';
import { NewsSectionTitle } from './NewsSectionTitle';
import { NewsPhotoGallery } from './NewsPhotoGallery';

interface Props {
  gallery?: GalleryItem | null;
  galleryId?: string | null;
}

export function NewsGalleryPhotos({ gallery, galleryId }: Props) {
  const embedded = gallery?.photos ?? [];
  const needsFetch = embedded.length === 0 && !!galleryId;
  const { data: fetched, isLoading } = useGalleryDetail(needsFetch ? galleryId : undefined);
  const photos = embedded.length > 0 ? embedded : (fetched?.photos ?? []);

  if (!galleryId && !gallery && photos.length === 0) return null;
  if (needsFetch && isLoading) {
    return (
      <section className="mt-12">
        <NewsSectionTitle>Galerija</NewsSectionTitle>
        <p className="text-center text-sm text-text-muted">Učitavanje fotografija…</p>
      </section>
    );
  }
  if (!photos.length) return null;

  return (
    <section className="mt-12">
      <NewsSectionTitle>Galerija</NewsSectionTitle>
      <NewsPhotoGallery photos={photos} />
    </section>
  );
}
