import { Link } from 'react-router-dom';
import { OnlinePaymentChoice } from '../payments/OnlinePaymentChoice';
import { MembershipBoxOfficeInfo } from './MembershipBoxOfficeInfo';
import { membershipStatusLabel } from '../../lib/membership-status';
import { Button } from '../ui/button';
import type { MembershipRow } from '../../types/membership';
import type { PaymentProviderId } from '../../types/payment-provider';

interface Props {
  current: MembershipRow;
  onlineAllowed: boolean;
  annualPrice: number;
  providers: PaymentProviderId[];
  busy: boolean;
  onPay: (provider: PaymentProviderId) => void;
  onRejoin: () => void;
  registerError?: boolean;
}

export function MembershipInactivePanel({
  current,
  onlineAllowed,
  annualPrice,
  providers,
  busy,
  onPay,
  onRejoin,
  registerError,
}: Props) {
  if (current.status === 'SUSPENDED') {
    return (
      <p className="text-sm text-text-muted">
        Vaše članstvo je {membershipStatusLabel(current.status).toLowerCase()}. Kontaktirajte klub putem{' '}
        <Link to="/kontakt" className="text-primary underline">
          kontakt forme
        </Link>
        .
      </p>
    );
  }

  if (onlineAllowed && annualPrice > 0) {
    const copy =
      current.status === 'EXPIRED'
        ? 'Članstvo je isteklo. Obnovite ga online.'
        : 'Članstvo je otkazano. Možete se ponovo učlaniti online.';
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-muted">{copy}</p>
        <OnlinePaymentChoice
          providers={providers}
          fullWidth
          disabled={busy}
          loading={busy}
          onSelect={onPay}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <MembershipBoxOfficeInfo />
      <Button className="w-full" disabled={busy} onClick={onRejoin}>
        {busy ? 'Obrada...' : 'Prijavi se ponovo'}
      </Button>
      {registerError && (
        <p className="text-sm text-danger">Prijava nije uspjela. Pokušajte ponovo ili kontaktirajte klub.</p>
      )}
    </div>
  );
}
