import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui/card';

export function PaymentProviderHints() {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <Hint title={t('admin.providerHints.stripeTitle')}>
        {t('admin.providerHints.stripeBody')} <strong>4242 4242 4242 4242</strong>.
        <span className="mt-2 block text-xs">{t('admin.providerHints.stripeWebhook')}</span>
      </Hint>
      <Hint title={t('admin.providerHints.paypalTitle')}>
        {t('admin.providerHints.paypalBody')}
        <span className="mt-2 block text-xs">{t('admin.providerHints.paypalWebhook')}</span>
      </Hint>
      <Hint title={t('admin.providerHints.monriTitle')}>
        {t('admin.providerHints.monriBody')}
        <span className="mt-2 block text-xs">{t('admin.providerHints.monriWebhook')}</span>
      </Hint>
    </div>
  );
}

function Hint({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="bg-surface/50 p-4 text-sm text-text-muted">
      <p className="font-medium text-text">{title}</p>
      <p className="mt-2">{children}</p>
    </Card>
  );
}
