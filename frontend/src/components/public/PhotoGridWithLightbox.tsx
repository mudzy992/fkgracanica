import { useState } from 'react';
import { galleryPreviewUrl, mediaUrl } from '../../lib/media';
import { Lightbox } from './Lightbox';

export interface PhotoItem {
  id: string;
  path: string;
  caption?: string | null;
}

interface Props {
  photos: PhotoItem[];
  columns?: 'two' | 'three';
}

export function PhotoGridWithLightbox({ photos, columns = 'two' }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridClass = columns === 'three' ? 'sm:grid-cols-2 md:grid-cols-3' : 'sm:grid-cols-2';

  const images = photos.map((p) => ({
    src: mediaUrl(p.path, 'original') ?? '',
    alt: p.caption ?? undefined,
  }));

  return (
    <>
      <div className={`grid gap-4 ${gridClass}`}>
        {photos.map((photo, index) => (
          <figure key={photo.id} className="overflow-hidden rounded-lg">
            <button
              type="button"
              className="w-full cursor-zoom-in"
              onClick={() => setLightboxIndex(index)}
            >
              <img
                src={galleryPreviewUrl(photo.path)}
                alt={photo.caption ?? ''}
                className="w-full object-cover transition hover:opacity-90"
              />
            </button>
            {photo.caption && (
              <figcaption className="p-2 text-sm text-text-muted">{photo.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </>
  );
}
