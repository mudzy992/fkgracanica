import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegisterMembership } from '../../hooks/use-membership';
import { useOnlineMembershipCheckout } from '../../hooks/use-online-checkout';
import { useAuth } from '../../lib/auth';
import { getReadyPaymentProviders } from '../../lib/payment-providers';
import { OnlinePaymentChoice } from '../payments/OnlinePaymentChoice';
import { MembershipJoinForm } from './MembershipJoinForm';
import { MembershipBoxOfficeInfo } from './MembershipBoxOfficeInfo';
import { MembershipCardPanel } from './MembershipCardPanel';
import { MembershipPendingStatus } from './MembershipPendingStatus';
import { membershipStatusLabel } from '../../lib/membership-status';
import { Skeleton } from '../ui/skeleton';
import type { MembershipRow } from '../../types/membership';
import type { PaymentProviderId } from '../../types/payment-provider';
import type { TicketingPublicConfig } from '../../types/ticketing-config';

interface Props {
  config?: TicketingPublicConfig;
  memberships?: MembershipRow[];
  confirmingPayment?: boolean;
  paymentCancelled?: boolean;
  paymentSuccess?: boolean;
}

function pickCurrent(items: MembershipRow[]): MembershipRow | undefined {
  return (
    items.find((m) => m.status === 'ACTIVE') ??
    items.find((m) => m.status === 'PENDING') ??
    items[0]
  );
}

export function MembershipPurchasePanel({
  config,
  memberships,
  confirmingPayment,
  paymentCancelled,
  paymentSuccess,
}: Props) {
  const { isAuthenticated, user } = useAuth();
  const register = useRegisterMembership();
  const checkout = useOnlineMembershipCheckout();
  const [awaitingPayId, setAwaitingPayId] = useState<string | null>(null);

  const moduleOn = config?.modulesMembership !== false;
  const onlineAllowed = config?.membershipOnlineEnabled && config?.onlineReady;
  const providers = getReadyPaymentProviders(config);
  const annualPrice = config?.membershipAnnualPrice ?? 0;
  const current = memberships?.length ? pickCurrent(memberships) : undefined;
  const busy = register.isPending || checkout.isPending;

  const payOnline = async (membershipId: string, provider: PaymentProviderId) => {
    const res = await checkout.mutateAsync({ membershipId, amount: annualPrice, provider });
    if (res.url) window.location.href = res.url;
  };

  const afterJoin = async (membershipId: string) => {
    if (providers.length === 1) await payOnline(membershipId, providers[0]);
    else setAwaitingPayId(membershipId);
  };

  const startPurchase = async (provider: PaymentProviderId) => {
    const created = await register.mutateAsync();
    if (onlineAllowed && created?.id) await payOnline(created.id, provider);
  };

  if (!moduleOn) {
    return <p className="text-sm text-text-muted">Članstvo trenutno nije dostupno.</p>;
  }

  if (confirmingPayment) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <p className="text-sm text-text-muted">Potvrđujemo uplatu i aktiviramo članstvo…</p>
      </div>
    );
  }

  if (awaitingPayId) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-muted">Odaberite način online plaćanja:</p>
        <OnlinePaymentChoice
          providers={providers}
          fullWidth
          loading={checkout.isPending}
          onSelect={(p) => void payOnline(awaitingPayId, p)}
        />
      </div>
    );
  }

  if (paymentCancelled) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-muted">Online uplata je otkazana. Možete pokušati ponovo.</p>
        {current?.status === 'PENDING' && (
          <MembershipPendingStatus
            onlineAllowed={!!onlineAllowed}
            userEmail={user?.email}
            showPayButton
            providers={providers}
            onPayOnline={(p) => void payOnline(current.id, p)}
            payLoading={checkout.isPending}
          />
        )}
      </div>
    );
  }

  if (isAuthenticated && current?.status === 'ACTIVE') {
    return (
      <div className="space-y-4">
        {paymentSuccess && (
          <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            Uplata je uspješna. Članstvo je aktivirano — ispod je vaša digitalna kartica.
          </p>
        )}
        <MembershipCardPanel membership={current} />
      </div>
    );
  }

  if (isAuthenticated && current?.status === 'PENDING') {
    return (
      <MembershipPendingStatus onlineAllowed={!!onlineAllowed} userEmail={user?.email} />
    );
  }

  if (isAuthenticated && current && ['SUSPENDED', 'EXPIRED', 'CANCELLED'].includes(current.status)) {
    return (
      <div className="space-y-4">
        {current.card && <MembershipCardPanel membership={current} />}
        {current.status === 'EXPIRED' && onlineAllowed && annualPrice > 0 ? (
          <>
            <p className="text-sm text-text-muted">Članstvo je isteklo. Obnovite ga online.</p>
            <OnlinePaymentChoice
              providers={providers}
              fullWidth
              disabled={busy}
              loading={busy}
              onSelect={(p) => void payOnline(current.id, p)}
            />
          </>
        ) : (
          <p className="text-sm text-text-muted">
            Vaše članstvo je {membershipStatusLabel(current.status).toLowerCase()}. Kontaktirajte klub putem{' '}
            <Link to="/kontakt" className="text-primary underline">
              kontakt forme
            </Link>
            .
          </p>
        )}
      </div>
    );
  }

  if (onlineAllowed && annualPrice > 0) {
    if (!isAuthenticated) {
      return <MembershipJoinForm annualPrice={annualPrice} onJoined={afterJoin} />;
    }

    return (
      <div className="space-y-3">
        <p className="text-sm">
          Prijavljeni ste kao <strong>{user?.email}</strong>
        </p>
        <p className="text-sm text-text-muted">Godišnja članarina: {annualPrice} KM</p>
        <OnlinePaymentChoice
          providers={providers}
          fullWidth
          disabled={busy}
          loading={busy}
          onSelect={(p) => void startPurchase(p)}
        />
        {register.isError && (
          <p className="text-sm text-danger">Kupovina nije uspjela. Možda već imate aktivno članstvo.</p>
        )}
      </div>
    );
  }

  return <MembershipBoxOfficeInfo />;
}
