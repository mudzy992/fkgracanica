import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Seo } from '../../../components/seo/Seo';
import { GalleryPhotoPicker } from '../../../components/admin/GalleryPhotoPicker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  useCreateGallery,
  useGalleryDetail,
  useUpdateGallery,
} from '../../../hooks/use-content-admin';
import { contentStatusLabel } from '../../../lib/content-status-labels';
import { GalleryAdminPhotos } from '../GalleryAdminPhotos';

export function GalleryEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const create = useCreateGallery();
  const update = useUpdateGallery();
  const { data: detail, isLoading } = useGalleryDetail(id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!detail) return;
    setTitle(detail.title);
    setDescription(detail.description ?? '');
  }, [detail]);

  const save = async () => {
    setError('');
    try {
      if (id) {
        await update.mutateAsync({ id, title, description: description || undefined });
        return;
      }
      const created = await create.mutateAsync({ title, description: description || undefined });
      navigate(`/admin/gallery/${created.id}/edit`, { replace: true });
    } catch {
      setError('Spremanje nije uspjelo.');
    }
  };

  if (id && isLoading) return <Skeleton className="h-96" />;

  const photos = detail?.photos ?? [];

  return (
    <>
      <Seo title={id ? 'Uredi galeriju' : 'Nova galerija'} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/admin/gallery" className="text-xs text-text-muted hover:underline">
            ← Galerija
          </Link>
          <h1 className="text-2xl font-bold text-text">{id ? 'Uredi galeriju' : 'Nova galerija'}</h1>
          {detail?.status ? (
            <p className="mt-1 text-xs text-text-muted">{contentStatusLabel(detail.status)}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link to="/admin/gallery">
            <Button variant="outline">Natrag</Button>
          </Link>
          <Button onClick={() => void save()} disabled={!title || create.isPending || update.isPending}>
            {id ? 'Sačuvaj' : 'Kreiraj album'}
          </Button>
        </div>
      </div>
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naslov albuma *" />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-200 bg-background p-2 text-sm"
          placeholder="Opis (opcionalno)"
        />
      </div>
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      {id ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text-muted">Fotografije ({photos.length})</h2>
            <GalleryPhotoPicker galleryId={id} existingPaths={photos.map((p) => p.path)} />
          </div>
          <GalleryAdminPhotos galleryId={id} photos={photos} />
        </section>
      ) : (
        <p className="text-sm text-text-muted">Nakon kreiranja albuma dodajete fotografije na cijelom ekranu.</p>
      )}
    </>
  );
}
