import { useEffect, useState } from 'react';
import {
  useCreateGallery,
  useUpdateGallery,
  useGalleryDetail,
} from '../../hooks/use-content-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { GalleryPhotoPicker } from '../../components/admin/GalleryPhotoPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { GalleryItem } from '../../types';
import { GalleryAdminPhotos } from './GalleryAdminPhotos';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: GalleryItem | null;
}

export function GalleryAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreateGallery();
  const update = useUpdateGallery();
  const [activeId, setActiveId] = useState<string | null>(null);
  const galleryId = edit?.id ?? activeId ?? undefined;
  const { data: detail } = useGalleryDetail(galleryId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveId(null);
      setFeedback(null);
      return;
    }
    setTitle(edit?.title ?? '');
    setDescription(edit?.description ?? '');
    setActiveId(edit?.id ?? null);
  }, [open, edit]);

  const save = async () => {
    setFeedback(null);
    try {
      if (galleryId) {
        await update.mutateAsync({ id: galleryId, title, description: description || undefined });
        onOpenChange(false);
        return;
      }
      const created = await create.mutateAsync({ title, description: description || undefined });
      setActiveId(created.id);
      setFeedback({ type: 'success', text: 'Galerija je kreirana. Dodajte fotografije.' });
    } catch {
      setFeedback({ type: 'error', text: 'Spremanje nije uspjelo. Pokušajte ponovo.' });
    }
  };

  const photos = detail?.photos ?? edit?.photos ?? [];
  const existingPaths = photos.map((p) => p.path);

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={galleryId ? 'Uredi galeriju' : 'Nova galerija'}
      size="xl"
    >
      <div className="space-y-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naslov *" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          placeholder="Opis"
        />
        {galleryId && (
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <p className="text-sm font-medium">Fotografije</p>
            <GalleryPhotoPicker galleryId={galleryId} existingPaths={existingPaths} />
            <GalleryAdminPhotos galleryId={galleryId} photos={photos} />
          </div>
        )}
        {feedback && (
          <p className={`text-sm ${feedback.type === 'error' ? 'text-danger' : 'text-success'}`}>
            {feedback.text}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={() => void save()} disabled={!title || create.isPending || update.isPending}>
            {galleryId ? 'Spremi' : 'Kreiraj'}
          </Button>
          {galleryId && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Zatvori
            </Button>
          )}
        </div>
      </div>
    </AdminFormSheet>
  );
}
