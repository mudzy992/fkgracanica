import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMatches, useReserveTicket } from '../../hooks';
import { useAuth } from '../../lib/auth';
import { formatDateTime } from '../../lib/utils';
import { FormShell } from '../../components/public/forms/FormShell';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

const schema = z.object({
  matchId: z.string().min(1, 'Odaberite utakmicu'),
  category: z.string().min(1, 'Unesite kategoriju'),
  price: z.number().positive('Cijena mora biti pozitivna'),
  quantity: z.number().int().min(1).max(10).optional(),
});

type FormData = z.infer<typeof schema>;

export function TicketsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const { data: matches, isLoading: ml } = useMatches();
  const reserve = useReserveTicket();
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  });

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-64 max-w-xl" />;

  const upcoming = matches?.filter((m) => m.status === 'SCHEDULED').slice(0, 20);

  const onSubmit = async (data: FormData) => {
    await reserve.mutateAsync(data);
    setDone(true);
    reset();
  };

  return (
    <div className="pb-16">
      <Seo title="Ulaznice" description="Rezervacija ulaznica za utakmice FK Gračanica" />
      <PageHeroHeader eyebrow="Stadion" title="Ulaznice" subtitle="Osigurajte svoje mjesto na utakmici." />
      <FormShell title="Rezervacija" description="Odaberite utakmicu i kategoriju ulaznica.">
        {!isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-text-muted">Za rezervaciju ulaznica potrebna je prijava na račun.</p>
            <Link to="/admin/login" state={{ from: location }}>
              <Button className="w-full">Prijavite se</Button>
            </Link>
          </div>
        ) : done ? (
          <div className="space-y-3">
            <p className="text-success">Ulaznice su uspješno rezervisane.</p>
            <Button variant="ghost" onClick={() => setDone(false)}>
              Nova rezervacija
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
            <p className="text-sm text-text-muted">Prijavljeni: {user?.email}</p>
            <div>
              <select
                className="flex h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)]"
                {...register('matchId')}
                disabled={ml}
              >
                <option value="">Odaberite utakmicu</option>
                {upcoming?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.homeClub?.name} vs {m.awayClub?.name} — {formatDateTime(m.scheduledAt)}
                  </option>
                ))}
              </select>
              {errors.matchId && <p className="text-xs text-danger">{errors.matchId.message}</p>}
            </div>
            <div>
              <Input placeholder="Kategorija (npr. tribina)" {...register('category')} />
              {errors.category && <p className="text-xs text-danger">{errors.category.message}</p>}
            </div>
            <div>
              <Input type="number" step="0.01" placeholder="Cijena (KM)" {...register('price', { valueAsNumber: true })} />
              {errors.price && <p className="text-xs text-danger">{errors.price.message}</p>}
            </div>
            <div>
              <Input type="number" placeholder="Količina" {...register('quantity', { valueAsNumber: true })} />
              {errors.quantity && <p className="text-xs text-danger">{errors.quantity.message}</p>}
            </div>
            {reserve.isError && <p className="text-sm text-danger">Rezervacija nije uspjela.</p>}
            <Button type="submit" className="w-full" disabled={reserve.isPending}>
              {reserve.isPending ? 'Rezervacija...' : 'Rezerviši ulaznice'}
            </Button>
          </form>
        )}
      </FormShell>
    </div>
  );
}
