import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { mediaUrl, type MediaVariant } from '../../lib/media';
import { cn } from '../../lib/utils';
import { Lightbox } from './Lightbox';

export interface PhotoBentoItem {
  id: string;
  path: string;
  caption?: string | null;
}

const BENTO_SPANS = [
  'col-span-2 row-span-2 min-h-[140px] sm:min-h-[180px]',
  'col-span-1 row-span-1 min-h-[68px] sm:min-h-[84px]',
  'col-span-1 row-span-1 min-h-[68px] sm:min-h-[84px]',
  'col-span-1 row-span-2 min-h-[140px] sm:min-h-[180px]',
  'col-span-1 row-span-1 min-h-[68px] sm:min-h-[84px]',
  'col-span-2 row-span-1 min-h-[76px] sm:min-h-[96px]',
];

function photoSrc(path: string, variant: MediaVariant) {
  return mediaUrl(path, variant);
}

function thumbSrc(path: string) {
  return photoSrc(path, 'thumb') ?? photoSrc(path, 'medium') ?? photoSrc(path, 'original');
}

interface Props {
  photos: PhotoBentoItem[];
}

export function PremiumPhotoBento({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = photos.map((p) => ({
    src: photoSrc(p.path, 'original') ?? '',
    alt: p.caption ?? undefined,
  }));

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:[grid-auto-rows:minmax(84px,auto)]">
        {photos.map((photo, index) => {
          const span = BENTO_SPANS[index % BENTO_SPANS.length];
          const src = thumbSrc(photo.path);

          return (
            <button
              key={photo.id}
              type="button"
              className={cn(
                'group relative cursor-zoom-in overflow-hidden rounded-xl border border-white/10 bg-background/50',
                'card-lift transition-transform',
                span,
              )}
              onClick={() => setLightboxIndex(index)}
              aria-label={photo.caption ? `Otvori: ${photo.caption}` : 'Otvori fotografiju'}
            >
              {src && (
                <img
                  src={src}
                  alt={photo.caption ?? ''}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-80" />
              <span className="pointer-events-none absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <ZoomIn size={14} />
              </span>
              {photo.caption && (
                <span className="pointer-events-none absolute bottom-0 left-0 right-0 truncate px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-wide text-white/75 sm:text-xs">
                  {photo.caption}
                </span>
              )}
            </button>
          );
        })}
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
