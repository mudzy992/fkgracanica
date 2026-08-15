import { useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import type { ContactFormData } from '../../../components/public/contact/ContactFormPanel';

const schema = z.object({
  name: z.string().min(2, 'Unesite ime (min. 2 znaka)'),
  email: z.string().email('Unesite ispravan email'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Poruka mora imati najmanje 10 znakova'),
});

const field =
  'h-12 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-blue-200/40 focus-visible:ring-blue-400';

type Props = {
  sent: boolean;
  pending: boolean;
  onSubmit: (data: ContactFormData) => Promise<void>;
};

export function ShowcaseContactForm({ sent, pending, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: zodResolver(schema) });

  if (sent) {
    return (
      <div className="flex min-h-[22rem] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-2xl text-emerald-300">
          ✓
        </span>
        <p className="font-display text-2xl font-bold text-white">Poruka je poslana</p>
        <p className="max-w-sm text-sm text-blue-100/70">Hvala. Klub će odgovoriti u najkraćem roku.</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300/80">Kontakt</p>
        <h3 className="font-display mt-2 text-2xl font-bold text-white sm:text-3xl">Pišite nam</h3>
        <p className="mt-2 text-sm text-blue-100/65">Pitanja o platformi, članstvu ili lansiranju.</p>
      </div>
      <Field label="Ime" error={errors.name?.message}>
        <Input placeholder="Vaše ime" className={field} {...register('name')} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" placeholder="vas@email.com" className={field} {...register('email')} />
      </Field>
      <Field label="Naslov (opcionalno)">
        <Input placeholder="Naslov poruke" className={field} {...register('subject')} />
      </Field>
      <Field label="Poruka" error={errors.message?.message}>
        <textarea
          className={`${field} min-h-36 w-full px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2`}
          placeholder="Kako možemo pomoći?"
          {...register('message')}
        />
      </Field>
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-blue-500 text-base font-semibold text-white shadow-[0_12px_40px_-12px_rgba(59,130,246,0.8)] hover:bg-blue-400"
      >
        {pending ? 'Šaljem…' : 'Pošalji poruku'}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-blue-200/70">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
