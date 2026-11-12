import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { Reveal } from '../../../lib/motion/Reveal';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

const schema = z.object({
  name: z.string().min(2, 'Unesite ime (min. 2 znaka)'),
  email: z.string().email('Unesite ispravan email'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Poruka mora imati najmanje 10 znakova'),
});

export type ContactFormData = z.infer<typeof schema>;

interface Props {
  sent: boolean;
  pending: boolean;
  defaultValues?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => Promise<void>;
}

export function ContactFormPanel({ sent, pending, defaultValues, onSubmit }: Props) {
  const id = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Reveal delay={0.1}>
      <NewsSectionTitle>Pišite nam</NewsSectionTitle>
      <div className="border-gradient-club glass-premium mt-2 rounded-2xl p-6 sm:p-8">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="text-success" size={40} />
            <p className="font-display text-lg font-semibold text-text">Poruka je uspješno poslana</p>
            <p className="text-sm text-text-muted">Hvala — odgovorit ćemo u najkraćem roku.</p>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
            <div>
              <label htmlFor={`${id}-name`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Ime
              </label>
              <Input id={`${id}-name`} placeholder="Vaše ime" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Email
              </label>
              <Input id={`${id}-email`} type="email" placeholder="vas@email.com" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor={`${id}-subject`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Naslov <span className="font-normal normal-case tracking-normal">(opcionalno)</span>
              </label>
              <Input id={`${id}-subject`} placeholder="Naslov poruke" {...register('subject')} />
            </div>
            <div>
              <label htmlFor={`${id}-message`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Poruka
              </label>
              <textarea
                id={`${id}-message`}
                className="flex min-h-36 w-full rounded-lg border border-[var(--border-subtle)] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)]"
                placeholder="Vaša poruka…"
                {...register('message')}
              />
              {errors.message && <p className="mt-1 text-xs text-danger">{errors.message.message}</p>}
            </div>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? 'Šaljem…' : 'Pošalji poruku'}
            </Button>
          </form>
        )}
      </div>
    </Reveal>
  );
}
