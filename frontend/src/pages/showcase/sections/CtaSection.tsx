import { useState, type FormEvent } from 'react';
import { useContactSubmit, useSubscribeNewsletter } from '../../../hooks';
import { getApiErrorMessage } from '../../../lib/api-error';
import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { ContactFormData } from '../../../components/public/contact/ContactFormPanel';
import { ShowcaseContactForm } from '../ShowcaseContactForm';
import type { ShowcaseClub } from '../types';

export function CtaSection({ club, index }: { club: ShowcaseClub; index: number }) {
  const [sent, setSent] = useState(false);
  const [newsDone, setNewsDone] = useState(false);
  const [email, setEmail] = useState('');
  const submit = useContactSubmit();
  const subscribe = useSubscribeNewsletter();

  const onContact = async (data: ContactFormData) => {
    await submit.mutateAsync(data);
    setSent(true);
  };

  const onNews = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await subscribe.mutateAsync(email);
      setNewsDone(true);
      setEmail('');
    } catch {
      /* shown via isError */
    }
  };

  return (
    <AnimatedSection id="kontakt" index={index} className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">Kontakt</p>
          <h2 className="font-display mt-2 text-3xl font-bold text-white sm:text-5xl">Ostajemo u vezi</h2>
          <p className="mt-4 text-blue-100/80">Pišite klubu ili ostavite email za obavijest o lansiranju.</p>
          <ul className="mt-8 space-y-3">
            <Info label="Email" value={club.email} />
            <Info label="Telefon" value={club.phone} />
            <Info label="Adresa" value={club.address} />
          </ul>
          <div className="mt-10">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-blue-200/70">Newsletter</p>
            {newsDone ? (
              <p className="text-sm text-emerald-300">Hvala na pretplati.</p>
            ) : (
              <form onSubmit={(e) => void onNews(e)} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="vas@email.com"
                  className="h-12 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-blue-200/40"
                />
                <Button type="submit" disabled={subscribe.isPending} className="h-12 shrink-0 rounded-xl px-6">
                  Pretplati se
                </Button>
              </form>
            )}
            {subscribe.isError ? (
              <p className="mt-2 text-xs text-red-300">
                {getApiErrorMessage(subscribe.error, 'Pretplata nije uspjela.')}
              </p>
            ) : null}
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-8">
          <ShowcaseContactForm sent={sent} pending={submit.isPending} onSubmit={onContact} />
        </div>
      </div>
    </AnimatedSection>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200/60">{label}</p>
      <p className="mt-0.5 text-sm text-white">{value}</p>
    </li>
  );
}
