import { useState } from 'react';
import { useMySeasonPass, useOpenSeasonPass } from '../../hooks/use-ticketing';
import { useOnlineSeasonPassCheckout } from '../../hooks/use-online-checkout';
import { getReadyPaymentProviders } from '../../lib/payment-providers';
import { OnlinePaymentChoice } from '../payments/OnlinePaymentChoice';
import { SeasonPassCard } from './SeasonPassCard';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import type { TicketingPublicConfig } from '../../types/ticketing-config';
import type { PaymentProviderId } from '../../types/payment-provider';

interface Props {
  config?: TicketingPublicConfig;
  paymentSuccess?: boolean;
  paymentCancelled?: boolean;
}

export function SeasonPassPanel({ config, paymentSuccess, paymentCancelled }: Props) {
  const { data, isLoading } = useMySeasonPass();
  const open = useOpenSeasonPass();
  const checkout = useOnlineSeasonPassCheckout();
  const [awaiting, setAwaiting] = useState<string | null>(null);
  const providers = getReadyPaymentProviders(config);
  const offer = data?.offer;
  const pass = data?.pass;
  const online = !!offer?.salesModes.online && providers.length > 0;
  const busy = open.isPending || checkout.isPending;

  const pay = async (passId: string, provider: PaymentProviderId) => {
    const res = await checkout.mutateAsync({ passId, provider });
    if (res.url) window.location.href = res.url;
  };

  const start = async (provider: PaymentProviderId) => {
    const created = pass?.status === 'PENDING' ? pass : await open.mutateAsync();
    /* v8 ignore next */
    if (created?.id) await pay(created.id, provider);
  };

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!offer?.season || !offer.available) {
    return <p className="text-sm text-text-muted">Sezonska karta trenutno nije u prodaji.</p>;
  }

  if (pass?.status === 'ACTIVE') {
    return (
      <div className="space-y-3">
        {paymentSuccess && (
          <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            Uplata je uspješna. Sezonska karta je aktivna.
          </p>
        )}
        <SeasonPassCard pass={pass} />
      </div>
    );
  }

  if (awaiting) {
    return (
      <OnlinePaymentChoice
        providers={providers}
        fullWidth
        loading={checkout.isPending}
        onSelect={(p) => void pay(awaiting, p)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {paymentCancelled && (
        <p className="text-sm text-text-muted">Online uplata je otkazana. Možete pokušati ponovo.</p>
      )}
      <p className="text-sm">
        {offer.label} · {offer.season.name} · <strong>{offer.price} KM</strong>
      </p>
      <p className="text-xs text-text-muted">Jedan QR za sve domaće utakmice u sezoni.</p>
      {online ? (
        providers.length === 1 ? (
          <Button disabled={busy} onClick={() => void start(providers[0])}>
            {busy ? 'Priprema…' : `Plati ${offer.price} KM`}
          </Button>
        ) : (
          <OnlinePaymentChoice
            providers={providers}
            fullWidth
            disabled={busy}
            loading={busy}
            onSelect={(p) => void start(p)}
          />
        )
      ) : (
        <p className="text-sm text-text-muted">Kupovina na blagajni stadiona.</p>
      )}
      {pass?.status === 'PENDING' && online && (
        <Button variant="outline" size="sm" onClick={() => setAwaiting(pass.id)}>
          Nastavi uplatu
        </Button>
      )}
    </div>
  );
}
