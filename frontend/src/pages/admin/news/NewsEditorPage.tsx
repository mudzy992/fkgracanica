import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Seo } from '../../../components/seo/Seo';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { useCreateNews, useNewsById, useUpdateNews } from '../../../hooks/use-news-admin';
import {
  emptyNewsForm,
  formToNewsBody,
  newsFormSchema,
  newsItemToForm,
  type NewsFormData,
} from '../news-form-utils';
import { NewsEditorMain } from './NewsEditorMain';
import { NewsEditorMeta } from './NewsEditorMeta';

export function NewsEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: item, isLoading } = useNewsById(id);
  const create = useCreateNews();
  const update = useUpdateNews();
  const [error, setError] = useState('');
  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: emptyNewsForm,
  });
  const { register, handleSubmit, reset, control, watch, setValue, formState } = form;

  useEffect(() => {
    if (item) reset(newsItemToForm(item));
  }, [item, reset]);

  const requestBack = () => {
    if (formState.isDirty && !window.confirm('Ima nesačuvanih izmjena. Napustiti?')) return;
    navigate('/admin/news');
  };

  const onSubmit = async (data: NewsFormData) => {
    setError('');
    try {
      const body = formToNewsBody(data);
      if (isEdit && id) {
        await update.mutateAsync({ id, ...body });
        navigate('/admin/news');
        return;
      }
      const created = await create.mutateAsync(body);
      navigate(`/admin/news/${created.id}/edit`, { replace: true });
    } catch {
      setError('Greška pri spremanju vijesti');
    }
  };

  if (isEdit && isLoading) return <Skeleton className="h-96" />;

  return (
    <>
      <Seo title={isEdit ? 'Uredi vijest' : 'Nova vijest'} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" onClick={requestBack} className="text-xs text-text-muted hover:underline">
            ← Vijesti
          </button>
          <h1 className="text-2xl font-bold text-text">{isEdit ? 'Uredi vijest' : 'Nova vijest'}</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={requestBack}>
            Odustani
          </Button>
          <Button
            type="submit"
            form="news-editor-form"
            disabled={formState.isSubmitting}
          >
            {isEdit ? 'Sačuvaj' : 'Kreiraj (nacrt)'}
          </Button>
        </div>
      </div>
      <form
        id="news-editor-form"
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <NewsEditorMain
          register={register}
          control={control}
          watch={watch}
          setValue={setValue}
          errors={formState.errors}
        />
        <NewsEditorMeta
          register={register}
          control={control}
          watch={watch}
          setValue={setValue}
          errors={formState.errors}
        />
      </form>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </>
  );
}
