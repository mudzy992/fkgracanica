import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateNews } from '../../hooks/use-news-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const schema = z.object({
  title: z.string().min(3, 'Naslov je obavezan'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Sadržaj je obavezan'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewsAdminFormSheet({ open, onOpenChange }: Props) {
  const create = useCreateNews();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await create.mutateAsync(data);
      reset();
      onOpenChange(false);
    } catch {
      setError('Greška pri kreiranju vijesti');
    }
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title="Nova vijest">
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Naslov</label>
          <Input {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Uvod</label>
          <Input {...register('excerpt')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sadržaj</label>
          <textarea
            {...register('content')}
            rows={8}
            className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
          />
          {errors.content && <p className="mt-1 text-xs text-danger">{errors.content.message}</p>}
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          Kreiraj (nacrt)
        </Button>
      </form>
    </AdminFormSheet>
  );
}
