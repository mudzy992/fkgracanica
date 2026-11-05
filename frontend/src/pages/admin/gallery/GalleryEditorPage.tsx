import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const create = useCreateGallery();
  const update = useUpdateGallery();
  const { data: detail, isLoading } = useGalleryDetail(id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const lastServerFields = useRef<{ id: string; title: string; description: string } | null>(null);
  const touched = useRef({ id, title: false, description: false });
  const markTouched = (field: 'title' | 'description') => {
    if (touched.current.id !== id) touched.current = { id, title: false, description: false };
    touched.current[field] = true;
  };
  useEffect(() => {
    if (!detail) return;
    const previous = lastServerFields.current;
    const incoming = { id: detail.id, title: detail.title, description: detail.description ?? '' };
    const edited = touched.current.id === incoming.id ? touched.current : { title: false, description: false };
    lastServerFields.current = incoming;
    // Ni oporavak prvog učitavanja ni foto-refetch ne smiju obrisati nacrt.
    setTitle((value) => previous?.id === incoming.id
      ? (value === previous.title ? incoming.title : value)
      : (edited.title ? value : incoming.title));
    setDescription((value) => previous?.id === incoming.id
      ? (value === previous.description ? incoming.description : value)
      : (edited.description ? value : incoming.description));
  }, [detail]);
  const existingPaths = useMemo(() => detail?.photos?.map((photo) => photo.path) ?? [], [detail?.photos]);

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
          <h1 className="text-2xl font-bold text-text">
            {id ? 'Uredi galeriju' : 'Nova galerija'}
          </h1>
          {detail?.status ? (
            <p className="mt-1 text-xs text-text-muted">{contentStatusLabel(detail.status)}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link to="/admin/gallery">
            <Button variant="outline">{t('actions.back')}</Button>
          </Link>
          <Button
            onClick={() => void save()}
            disabled={!title || create.isPending || update.isPending}
          >
            {id ? t('actions.save') : t('admin.galleryEditor.createAlbum')}
          </Button>
        </div>
      </div>
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Input
          value={title}
          onChange={(e) => { markTouched('title'); setTitle(e.target.value); }}
          placeholder={t('admin.galleryEditor.titleRequired')}
        />
        <textarea
          value={description}
          onChange={(e) => { markTouched('description'); setDescription(e.target.value); }}
          rows={2}
          className="w-full rounded-lg border border-slate-200 bg-background p-2 text-sm"
          placeholder={t('admin.galleryEditor.descriptionOptional')}
        />
      </div>
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      {id ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text-muted">
              {t('admin.galleryEditor.photos', { count: photos.length })}
            </h2>
            <GalleryPhotoPicker key={id} galleryId={id} existingPaths={existingPaths} />
          </div>
          <GalleryAdminPhotos galleryId={id} photos={photos} />
        </section>
      ) : (
        <p className="text-sm text-text-muted">{t('admin.galleryEditor.afterCreate')}</p>
      )}
    </>
  );
}
