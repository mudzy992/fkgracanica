import { Link } from 'react-router-dom';
import { useRegisterMembership } from '../../hooks/use-membership';
import { useOnlineMembershipCheckout } from '../../hooks/use-online-checkout';
import { useAuth } from '../../lib/auth';
import { MembershipJoinForm } from './MembershipJoinForm';
import { MembershipBoxOfficeInfo } from './MembershipBoxOfficeInfo';
import { MembershipCardPanel } from './MembershipCardPanel';
import { MembershipPendingStatus } from './MembershipPendingStatus';
import { membershipStatusLabel } from '../../lib/membership-status';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import type { MembershipRow } from '../../types/membership';
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

  const moduleOn = config?.modulesMembership !== false;
  const onlineAllowed = config?.membershipOnlineEnabled && config?.onlineReady;
  const annualPrice = config?.membershipAnnualPrice ?? 0;
  const current = memberships?.length ? pickCurrent(memberships) : undefined;

  const payOnline = async (membershipId: string) => {
    const res = await checkout.mutateAsync({ membershipId, amount: annualPrice });
    if (res.url) window.location.href = res.url;
  };

  const startPurchase = async () => {
    const created = await register.mutateAsync();
    if (onlineAllowed && created?.id) await payOnline(created.id);
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

  if (paymentCancelled) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-muted">Online uplata je otkazana. Možete pokušati ponovo.</p>
        {current?.status === 'PENDING' && (
          <MembershipPendingStatus
            onlineAllowed={!!onlineAllowed}
            annualPrice={annualPrice}
            userEmail={user?.email}
            showPayButton
            onPayOnline={() => void payOnline(current.id)}
            payLoading={checkout.isPending}
          />
        )}
      </div>
    );
  }

  if (isAuthenticated && current?.status === 'ACTIVE') {
    return (
      <div className="space-y-4">
        {paymentSuccess ? (
          <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            Uplata je uspješna. Članstvo je aktivirano — ispod je vaša digitalna kartica.
          </p>
        ) : (
          <p className="text-sm text-success">Članstvo je aktivno.</p>
        )}
        <MembershipCardPanel membership={current} />
        {onlineAllowed && annualPrice > 0 && (
          <Button
            variant="outline"
            className="w-full"
            disabled={checkout.isPending}
            onClick={() => void payOnline(current.id)}
          >
            {checkout.isPending ? 'Preusmjeravanje...' : `Obnovi članstvo online · ${annualPrice} KM`}
          </Button>
        )}
      </div>
    );
  }

  if (isAuthenticated && current?.status === 'PENDING') {
    return (
      <MembershipPendingStatus
        onlineAllowed={!!onlineAllowed}
        userEmail={user?.email}
      />
    );
  }

  if (isAuthenticated && current && ['SUSPENDED', 'EXPIRED', 'CANCELLED'].includes(current.status)) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-danger">
          Vaše članstvo je {membershipStatusLabel(current.status).toLowerCase()}.
        </p>
        {onlineAllowed && current.status === 'EXPIRED' ? (
          <>
            <p className="text-sm text-text-muted">Možete obnoviti članstvo online.</p>
            <Button className="w-full" disabled={register.isPending || checkout.isPending} onClick={() => void startPurchase()}>
              {register.isPending || checkout.isPending
                ? 'Obrada...'
                : `Obnovi članstvo · ${annualPrice} KM`}
            </Button>
          </>
        ) : (
          <p className="text-sm text-text-muted">
            Kontaktirajte klub putem{' '}
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
      return <MembershipJoinForm annualPrice={annualPrice} onJoined={payOnline} />;
    }

    return (
      <div className="space-y-3">
        <p className="text-sm">
          Prijavljeni ste kao <strong>{user?.email}</strong>
        </p>
        <p className="text-sm text-text-muted">Godišnja članarina: {annualPrice} KM</p>
        <Button className="w-full" disabled={register.isPending || checkout.isPending} onClick={() => void startPurchase()}>
          {register.isPending || checkout.isPending
            ? 'Obrada...'
            : `Kupi članstvo online · ${annualPrice} KM`}
        </Button>
        {register.isError && (
          <p className="text-sm text-danger">Kupovina nije uspjela. Možda već imate aktivno članstvo.</p>
        )}
      </div>
    );
  }

  return <MembershipBoxOfficeInfo />;
}
