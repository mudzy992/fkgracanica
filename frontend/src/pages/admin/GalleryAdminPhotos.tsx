import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useRemoveGalleryPhoto, useReorderGalleryPhotos } from '../../hooks/use-content-admin';
import { mediaUrl } from '../../lib/media';
import { Button } from '../../components/ui/button';
import type { GalleryPhoto } from '../../types';

interface Props {
  galleryId: string;
  photos: GalleryPhoto[];
}

export function GalleryAdminPhotos({ galleryId, photos }: Props) {
  const removePhoto = useRemoveGalleryPhoto();
  const reorder = useReorderGalleryPhotos();

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= photos.length) return;
    const ids = photos.map((p) => p.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    void reorder.mutateAsync({ galleryId, photoIds: ids });
  };

  if (!photos.length) {
    return <p className="text-sm text-text-muted">Još nema fotografija. Dodajte slike ili mapu.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((p, index) => (
        <figure
          key={p.id}
          className="group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-surface/40"
        >
          <img
            src={mediaUrl(p.path, 'medium')}
            alt={p.caption ?? ''}
            className="aspect-square w-full object-cover"
          />
          <figcaption className="truncate px-2 py-1.5 text-xs text-text-muted">
            {p.caption ?? p.path.split('/').pop()}
          </figcaption>
          <div className="absolute top-2 right-2 flex gap-1 rounded-lg bg-background/90 p-0.5 opacity-0 transition group-hover:opacity-100">
            <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, -1)}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={index === photos.length - 1}
              onClick={() => move(index, 1)}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void removePhoto.mutateAsync({ galleryId, photoId: p.id })}
            >
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          </div>
        </figure>
      ))}
    </div>
  );
}
