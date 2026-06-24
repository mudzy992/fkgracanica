import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContactSubmit } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

type FormData = z.infer<typeof schema>;

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = useContactSubmit();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await submit.mutateAsync(data);
    setSent(true);
    reset();
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Seo title="Kontakt" />
      <h1 className="mb-8 text-3xl font-bold">Kontakt</h1>
      <Card>
        <CardContent className="p-6">
          {sent ? (
            <p className="text-success">Poruka je uspješno poslana.</p>
          ) : (
            <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
              <div>
                <Input placeholder="Ime" {...register('name')} />
                {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
              </div>
              <div>
                <Input type="email" placeholder="Email" {...register('email')} />
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>
              <Input placeholder="Naslov (opcionalno)" {...register('subject')} />
              <div>
                <textarea
                  className="flex min-h-32 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Poruka"
                  {...register('message')}
                />
                {errors.message && <p className="text-xs text-danger">{errors.message.message}</p>}
              </div>
              <Button type="submit" disabled={submit.isPending}>
                Pošalji
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
