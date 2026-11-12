import { useTranslation } from 'react-i18next';
import type { PaymentReturnStatus } from '../../hooks/use-payment-session-return';
import { Button } from '../ui/button';

interface Props {
  status: PaymentReturnStatus;
  onRetry: () => void;
}

export function PaymentReturnNotice({ status, onRetry }: Props) {
  const { t } = useTranslation();
  if (status !== 'pending' && status !== 'error') return null;
  return (
    <div role="status" className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-surface p-4 text-sm text-text">
      <p>{t(`paymentReturn.${status}`)}</p>
      <p>{t('paymentReturn.retryInfo')}</p>
      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
        {t('paymentReturn.retry')}
      </Button>
    </div>
  );
}
