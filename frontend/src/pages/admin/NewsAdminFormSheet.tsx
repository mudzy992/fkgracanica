import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateNews, useUpdateNews } from '../../hooks/use-news-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import type { NewsItem } from '../../types';
import { NewsAdminFormFields } from './NewsAdminFormFields';
import {
  emptyNewsForm,
  formToNewsBody,
  newsFormSchema,
  newsItemToForm,
  type NewsFormData,
} from './news-form-utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: NewsItem | null;
}

export function NewsAdminFormSheet({ open, onOpenChange, item }: Props) {
  const create = useCreateNews();
  const update = useUpdateNews();
  const [error, setError] = useState('');
  const isEdit = !!item;

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: emptyNewsForm,
  });

  const { register, handleSubmit, reset, control, watch, setValue, formState } = form;

  useEffect(() => {
    reset(item ? newsItemToForm(item) : emptyNewsForm);
    setError('');
  }, [item, open, reset]);

  const onSubmit = async (data: NewsFormData) => {
    setError('');
    try {
      const body = formToNewsBody(data);
      if (isEdit && item) await update.mutateAsync({ id: item.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch {
      setError('Greška pri spremanju vijesti');
    }
  };

  const requestClose = () => {
    if (formState.isDirty && !window.confirm('Ima nesačuvanih izmjena. Zatvoriti?')) return;
    onOpenChange(false);
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={(o) => (o ? onOpenChange(true) : requestClose())}
      title={isEdit ? 'Uredi vijest' : 'Nova vijest'}
      dirty={formState.isDirty}
      size="lg"
    >
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
        <NewsAdminFormFields
          register={register}
          control={control}
          watch={watch}
          setValue={setValue}
          errors={formState.errors}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={requestClose}>
            Odustani
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {isEdit ? 'Sačuvaj' : 'Kreiraj (nacrt)'}
          </Button>
        </div>
      </form>
    </AdminFormSheet>
  );
}
