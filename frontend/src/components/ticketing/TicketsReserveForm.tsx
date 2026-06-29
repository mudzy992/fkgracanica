import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMatchAvailability, useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { formatDateTime } from '../../lib/utils';
import { matchLabel } from '../../lib/ticketing-status';
import { getReadyPaymentProviders } from '../../lib/payment-providers';
import { Input } from '../ui/input';
import { TicketsReserveActions } from './TicketsReserveActions';

interface Props {
  onSuccess: (orderId?: string) => void;
}

export function TicketsReserveForm({ onSuccess }: Props) {
  const { data: config } = useTicketingPublicConfig();
  const activeMatch = config?.activeTicketMatch;
  const matchId = activeMatch?.id ?? '';

  const schema = z.object({
    categoryId: z.string().min(1, 'Odaberite kategoriju'),
    quantity: z.number().int().min(1).max(50),
  });

  type FormData = z.infer<typeof schema>;

  const { register, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  });

  const categoryId = watch('categoryId');
  const quantity = watch('quantity') || 1;
  const { data: availability } = useMatchAvailability(matchId || undefined);

  const categories = config?.categories ?? [];
  const category = categories.find((c) => c.id === categoryId);
  const sales = config?.salesModes;
  const boxOffice = !!sales?.boxOffice;
  const online = !!sales?.online;
  const providers = getReadyPaymentProviders(config);

  const boxOfficeMax = Math.min(
    availability?.userRemainingQuota ?? config?.maxBoxOfficeTicketsPerUser ?? 4,
    availability?.remaining ?? 999,
  );
  const onlineMax = availability?.remaining ?? 999;
  const inputMax = boxOffice && online ? Math.max(boxOfficeMax, onlineMax) : online && !boxOffice ? onlineMax : boxOfficeMax;

  const unitPrice = category
    ? (availability?.memberDiscountPercent ?? 0) > 0
      ? category.price * (1 - (availability!.memberDiscountPercent / 100))
      : category.price
    : 0;

  if (!boxOffice && !online) {
    return <p className="text-sm text-text-muted">Kupovina ulaznica trenutno nije dostupna.</p>;
  }

  if (!activeMatch) {
    return <p className="text-sm text-text-muted">Trenutno nema zakazane domaće utakmice za ulaznice.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border-subtle)] bg-surface/50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Utakmica</p>
        <p className="mt-1 font-medium">{matchLabel(activeMatch)}</p>
        <p className="text-sm text-text-muted">{formatDateTime(activeMatch.scheduledAt)}</p>
      </div>

      {availability && (
        <p className="text-sm text-text-muted">
          Slobodnih mjesta: <strong>{availability.remaining}</strong> / {availability.capacity}
          {availability.memberDiscountPercent > 0 && (
            <> · Popust člana: {availability.memberDiscountPercent}%</>
          )}
          {boxOffice && availability.maxPerUser != null && (
            <> · Limit blagajna: {availability.userTickets}/{availability.maxPerUser}</>
          )}
        </p>
      )}

      <div>
        <select
          className="flex h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm"
          {...register('categoryId')}
        >
          <option value="">Kategorija ulaznice</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} — {c.price} KM
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
      </div>

      <div>
        <Input
          type="number"
          min={1}
          max={Math.max(1, inputMax)}
          placeholder="Količina"
          {...register('quantity', { valueAsNumber: true })}
        />
        {errors.quantity && <p className="text-xs text-danger">{errors.quantity.message}</p>}
      </div>

      {category && (
        <p className="text-sm">
          Cijena po ulaznici: <strong>{unitPrice.toFixed(2)} KM</strong>
          {quantity > 1 && <> · Ukupno: {(unitPrice * quantity).toFixed(2)} KM</>}
        </p>
      )}

      {online && providers.length > 0 && (
        <p className="text-xs text-text-muted">
          Online plaćanje putem: {providers.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}.
        </p>
      )}
      {boxOffice && (
        <p className="text-xs text-text-muted">
          Rezervacija za blagajnu: plaćanje i preuzimanje ulaznica na stadionu.
        </p>
      )}

      {category && (
        <TicketsReserveActions
          matchId={matchId}
          category={category}
          quantity={quantity}
          boxOfficeMax={boxOfficeMax}
          onlineMax={onlineMax}
          remaining={availability?.remaining ?? 0}
          boxOffice={boxOffice}
          online={online}
          onReserved={onSuccess}
        />
      )}
    </div>
  );
}
