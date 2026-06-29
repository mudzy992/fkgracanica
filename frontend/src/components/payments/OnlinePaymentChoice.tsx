import type { PaymentProviderId } from '../../types/payment-provider';
import { PAYMENT_PROVIDER_LABELS } from '../../types/payment-provider';
import { PaymentProviderLogo } from './PaymentProviderLogo';
import { Button } from '../ui/button';

const PROVIDER_STYLES: Record<PaymentProviderId, string> = {
  stripe: 'bg-[#635bff] text-white hover:bg-[#5851e5]',
  paypal: 'bg-[#0070ba] text-white hover:bg-[#005ea6]',
  monri: 'bg-[#1a1a2e] text-white hover:bg-[#2d2d44]',
};

interface Props {
  providers: PaymentProviderId[];
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'default';
  onSelect: (provider: PaymentProviderId) => void;
}

export function OnlinePaymentChoice({
  providers,
  disabled,
  loading,
  fullWidth,
  size = 'default',
  onSelect,
}: Props) {
  if (!providers.length) return null;

  if (providers.length === 1) {
    const id = providers[0];
    return (
      <Button
        type="button"
        size={size}
        className={fullWidth ? 'w-full gap-2' : 'gap-2'}
        disabled={disabled || loading}
        onClick={() => onSelect(id)}
      >
        <PaymentProviderLogo id={id} className="text-white" />
        {loading ? 'Preusmjeravanje...' : 'Plati online'}
      </Button>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {providers.map((id) => (
        <button
          key={id}
          type="button"
          disabled={disabled || loading}
          aria-label={`Plati putem ${PAYMENT_PROVIDER_LABELS[id]}`}
          onClick={() => onSelect(id)}
          className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 transition disabled:opacity-50 ${PROVIDER_STYLES[id]} ${fullWidth ? 'flex-1' : ''}`}
        >
          <PaymentProviderLogo id={id} className="text-white" />
        </button>
      ))}
    </div>
  );
}
