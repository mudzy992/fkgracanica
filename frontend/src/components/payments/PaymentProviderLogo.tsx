import type { PaymentProviderId } from '../../types/payment-provider';

interface Props {
  id: PaymentProviderId;
  className?: string;
}

export function PaymentProviderLogo({ id, className = '' }: Props) {
  if (id === 'stripe') {
    return (
      <svg viewBox="0 0 60 25" className={`h-5 w-auto ${className}`} aria-hidden>
        <text x="0" y="18" fill="currentColor" fontSize="16" fontWeight="700" fontFamily="system-ui">
          stripe
        </text>
      </svg>
    );
  }
  if (id === 'paypal') {
    return (
      <svg viewBox="0 0 80 24" className={`h-5 w-auto ${className}`} aria-hidden>
        <text x="0" y="17" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="system-ui">
          PayPal
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 24" className={`h-5 w-auto ${className}`} aria-hidden>
      <text x="0" y="17" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="system-ui">
        Monri
      </text>
    </svg>
  );
}
