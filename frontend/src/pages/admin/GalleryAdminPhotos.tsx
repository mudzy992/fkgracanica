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

  return (
    <div className="space-y-2">
      {photos.map((p, index) => (
        <div key={p.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
          <img src={mediaUrl(p.path, 'thumb')} alt="" className="h-12 w-12 rounded object-cover" />
          <span className="min-w-0 flex-1 truncate text-sm">{p.caption ?? p.path}</span>
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
      ))}
    </div>
  );
}
