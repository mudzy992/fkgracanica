import { useState, type FormEvent } from 'react';
import { useContactSubmit, useSubscribeNewsletter } from '../../../hooks';
import { getApiErrorMessage } from '../../../lib/api-error';
import { AnimatedSection } from '../../../lib/motion/AnimatedSection';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  ContactFormPanel,
  type ContactFormData,
} from '../../../components/public/contact/ContactFormPanel';
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
    <AnimatedSection index={index} className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/80">Kontakt</p>
          <h2 className="font-display mt-2 text-3xl font-bold text-white">Ostajemo u vezi</h2>
          <p className="mt-3 text-blue-100/80">Pišite klubu ili ostavite email za obavijest o lansiranju.</p>
          <ul className="mt-6 space-y-1 text-sm text-blue-100">
            {club.email ? <li>{club.email}</li> : null}
            {club.phone ? <li>{club.phone}</li> : null}
            {club.address ? <li>{club.address}</li> : null}
          </ul>
          <div className="mt-8">
            {newsDone ? (
              <p className="text-sm text-emerald-300">Hvala na pretplati.</p>
            ) : (
              <form onSubmit={(e) => void onNews(e)} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="Email za newsletter"
                  className="bg-white/10 text-white placeholder:text-blue-200/50"
                />
                <Button type="submit" disabled={subscribe.isPending} className="shrink-0">
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
        <div className="rounded-2xl border border-white/10 bg-white p-1 text-text">
          <ContactFormPanel sent={sent} pending={submit.isPending} onSubmit={onContact} />
        </div>
      </div>
    </AnimatedSection>
  );
}
