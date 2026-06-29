import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePublicSettings, useContactSubmit } from '../../hooks';
import { useAuth } from '../../lib/auth';
import { FormShell } from '../../components/public/forms/FormShell';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';
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
  const { data: settings } = usePublicSettings();
  const { user, isAuthenticated } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.email) setValue('email', user.email);
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (name) setValue('name', name);
  }, [isAuthenticated, user, setValue]);

  const onSubmit = async (data: FormData) => {
    await submit.mutateAsync(data);
    setSent(true);
    reset();
  };

  return (
    <div className="pb-16">
      <Seo title="Kontakt" />
      <PageHeroHeader eyebrow="Podrška" title="Kontakt" subtitle="Pošaljite nam poruku — odgovaramo u najkraćem roku." />
      <FormShell
        title="Pišite nam"
        description="Imate pitanje, prijedlog ili želite suradnju? Popunite formu."
        aside={
          <ul className="space-y-2 text-sm text-text-muted">
            {settings?.['contact.email'] && <li>{settings['contact.email']}</li>}
            {settings?.['contact.phone'] && <li>{settings['contact.phone']}</li>}
            {settings?.['contact.address'] && <li>{settings['contact.address']}</li>}
          </ul>
        }
      >
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
                className="flex min-h-32 w-full rounded-lg border border-[var(--border-subtle)] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)]"
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
      </FormShell>
    </div>
  );
}
