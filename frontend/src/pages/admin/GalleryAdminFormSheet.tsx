import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  useAddGalleryPhoto,
  useCreateGallery,
  useGalleryDetail,
  useRemoveGalleryPhoto,
  useUpdateGallery,
} from '../../hooks/use-content-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { GalleryItem } from '../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: GalleryItem | null;
}

export function GalleryAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreateGallery();
  const update = useUpdateGallery();
  const addPhoto = useAddGalleryPhoto();
  const removePhoto = useRemoveGalleryPhoto();
  const { data: detail } = useGalleryDetail(edit?.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoPath, setPhotoPath] = useState('');
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(edit?.title ?? '');
    setDescription(edit?.description ?? '');
    setPhotoPath('');
    setCaption('');
  }, [open, edit]);

  const save = async () => {
    if (edit) await update.mutateAsync({ id: edit.id, title, description: description || undefined });
    else await create.mutateAsync({ title, description: description || undefined });
    onOpenChange(false);
  };

  const photos = detail?.photos ?? edit?.photos ?? [];

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi galeriju' : 'Nova galerija'}>
      <div className="space-y-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naslov *" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          placeholder="Opis"
        />
        {edit && (
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <p className="text-sm font-medium">Fotografije</p>
            {photos.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{p.caption ?? p.path}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void removePhoto.mutateAsync({ galleryId: edit.id, photoId: p.id })}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            ))}
            <MediaPicker value={photoPath} onChange={setPhotoPath} label="Nova fotografija" />
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Opis (opcionalno)" />
            <Button
              variant="outline"
              size="sm"
              disabled={!photoPath || addPhoto.isPending}
              onClick={() => {
                void addPhoto
                  .mutateAsync({ galleryId: edit.id, path: photoPath, caption: caption || undefined })
                  .then(() => {
                    setPhotoPath('');
                    setCaption('');
                  });
              }}
            >
              Dodaj fotografiju
            </Button>
          </div>
        )}
        <Button onClick={() => void save()} disabled={!title || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
