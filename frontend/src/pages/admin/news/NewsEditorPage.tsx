import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { isInvalidChangedYouTubeUrl } from '../../../lib/youtube';
import { getApiErrorMessage } from '../../../lib/api-error';
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
  const { t } = useTranslation();
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
  /**
   * Q-FE06-37: react-hook-form računa `isDirty` samo za polja na koja je
   * pretplaćen tokom renderovanja. Čitanje isključivo u rukovaocu (`requestBack`)
   * vraćalo je uvijek `false`, pa potvrda o nesačuvanim izmjenama nikad nije
   * izlazila. Pretplata ispod je jedina promjena ponašanja: potvrda se sada
   * stvarno prikazuje kad forma ima izmjene.
   */
  const isDirty = formState.isDirty;

  useEffect(() => {
    if (item) reset(newsItemToForm(item));
  }, [item, reset]);

  const requestBack = () => {
    if (isDirty && !window.confirm('Ima nesačuvanih izmjena. Napustiti?')) return;
    navigate('/admin/news');
  };

  const onSubmit = async (data: NewsFormData) => {
    setError('');
    if (isInvalidChangedYouTubeUrl(data.videoUrl, item?.videoUrl)) {
      form.setError('videoUrl', { type: 'validate', message: t('video.invalidInput') }, { shouldFocus: true });
      return;
    }
    try {
      const body = formToNewsBody(data, item?.videoUrl);
      if (isEdit && id) {
        await update.mutateAsync({ id, ...body });
        navigate('/admin/news');
        return;
      }
      const created = await create.mutateAsync(body);
      navigate(`/admin/news/${created.id}/edit`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Greška pri spremanju vijesti'));
    }
  };

  if (isEdit && isLoading) return <Skeleton className="h-96" />;

  return (
    <>
      <Seo title={isEdit ? 'Uredi vijest' : 'Nova vijest'} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={requestBack}
            className="h-auto p-0 text-xs text-text-muted hover:bg-transparent hover:text-text hover:underline"
          >
            ← Vijesti
          </Button>
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
      {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}
    </>
  );
}
