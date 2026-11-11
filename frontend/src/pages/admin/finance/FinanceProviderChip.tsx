import { PaymentProviderLogo } from '../../../components/payments/PaymentProviderLogo';
import type { PaymentProviderId } from '../../../types/payment-provider';
import { Button } from '../../../components/ui/button';
import { PROVIDER_META, isFinanceProvider } from './finance-labels';

const ONLINE: PaymentProviderId[] = ['stripe', 'paypal', 'monri'];

export function FinanceProviderChip({
  id,
  selected,
  onClick,
}: {
  id: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const meta = isFinanceProvider(id)
    ? PROVIDER_META[id]
    : { label: id, className: 'bg-surface text-text' };
  const online = ONLINE.includes(id as PaymentProviderId);
  const className = [
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
    meta.className,
    onClick ? 'cursor-pointer' : '',
    selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : '',
    onClick && !selected ? 'opacity-75 hover:opacity-100' : '',
  ].join(' ');
  const inner = (
    <>
      {online ? <PaymentProviderLogo id={id as PaymentProviderId} className="h-3.5 text-white" /> : null}
      {meta.label}
    </>
  );
  if (onClick) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`${className} h-auto rounded-full`}
        onClick={onClick}
        aria-pressed={!!selected}
      >
        {inner}
      </Button>
    );
  }
  return <span className={className}>{inner}</span>;
}
