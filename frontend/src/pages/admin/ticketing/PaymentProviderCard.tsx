import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import type { ProviderGate } from '../../../types/ticketing-config';
import { providerGateBadge } from './provider-gate.util';

type ProviderId = 'stripe' | 'paypal' | 'monri';

interface Props {
  id: ProviderId;
  label: string;
  gate: ProviderGate;
  settings: Record<string, string>;
  onSet: (key: string, value: string) => void;
}

export function PaymentProviderCard({ id, label, gate, settings, onSet }: Props) {
  const { t } = useTranslation();
  const badge = providerGateBadge(gate);
  const prefix = `payments.${id}`;
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">{label}</h3>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <label className="mb-3 flex items-center gap-2 text-sm">
        <Switch
          checked={settings[`${prefix}.enabled`] === 'true'}
          onCheckedChange={(v) => onSet(`${prefix}.enabled`, String(v))}
        />
        {t('admin.payments.enabled')}
      </label>
      {id === 'stripe' && <StripeFields settings={settings} onSet={onSet} />}
      {id === 'paypal' && <PaypalFields settings={settings} onSet={onSet} />}
      {id === 'monri' && <MonriFields settings={settings} onSet={onSet} />}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs text-text-muted">{label}</p>
      {children}
    </div>
  );
}

function StripeFields({
  settings,
  onSet,
}: {
  settings: Record<string, string>;
  onSet: (key: string, value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Field label={t('admin.payments.stripe.publishableKey')}>
        <Input
          value={settings['payments.stripe.publishableKey'] ?? ''}
          onChange={(e) => onSet('payments.stripe.publishableKey', e.target.value)}
        />
      </Field>
      <Field label={t('admin.payments.stripe.secretKey')}>
        <Input
          type="password"
          value={settings['payments.stripe.secretKey'] ?? ''}
          onChange={(e) => onSet('payments.stripe.secretKey', e.target.value)}
        />
      </Field>
      <Field label={t('admin.payments.stripe.webhookSecret')}>
        <Input
          type="password"
          value={settings['payments.stripe.webhookSecret'] ?? ''}
          onChange={(e) => onSet('payments.stripe.webhookSecret', e.target.value)}
        />
      </Field>
    </div>
  );
}

function PaypalFields({
  settings,
  onSet,
}: {
  settings: Record<string, string>;
  onSet: (key: string, value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Field label={t('admin.payments.paypal.clientId')}>
        <Input
          value={settings['payments.paypal.clientId'] ?? ''}
          onChange={(e) => onSet('payments.paypal.clientId', e.target.value)}
        />
      </Field>
      <Field label={t('admin.payments.paypal.clientSecret')}>
        <Input
          type="password"
          value={settings['payments.paypal.clientSecret'] ?? ''}
          onChange={(e) => onSet('payments.paypal.clientSecret', e.target.value)}
        />
      </Field>
      <Field label={t('admin.payments.mode.label')}>
        <Select
          value={settings['payments.paypal.mode'] || 'sandbox'}
          onChange={(e) => onSet('payments.paypal.mode', e.target.value)}
        >
          <option value="sandbox">{t('admin.payments.mode.sandbox')}</option>
          <option value="live">{t('admin.payments.mode.live')}</option>
        </Select>
      </Field>
      <Field label={t('admin.payments.paypal.currency')}>
        <Input
          value={settings['payments.paypal.currency'] ?? 'EUR'}
          onChange={(e) => onSet('payments.paypal.currency', e.target.value)}
        />
      </Field>
      <Field label={t('admin.payments.paypal.webhookId')}>
        <Input
          value={settings['payments.paypal.webhookId'] ?? ''}
          onChange={(e) => onSet('payments.paypal.webhookId', e.target.value)}
        />
      </Field>
    </div>
  );
}

function MonriFields({
  settings,
  onSet,
}: {
  settings: Record<string, string>;
  onSet: (key: string, value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Field label={t('admin.payments.monri.merchantKey')}>
        <Input
          value={settings['payments.monri.merchantKey'] ?? ''}
          onChange={(e) => onSet('payments.monri.merchantKey', e.target.value)}
        />
      </Field>
      <Field label={t('admin.payments.monri.authToken')}>
        <Input
          type="password"
          value={settings['payments.monri.authenticationKey'] ?? ''}
          onChange={(e) => onSet('payments.monri.authenticationKey', e.target.value)}
        />
      </Field>
      <Field label={t('admin.payments.mode.label')}>
        <Select
          value={settings['payments.monri.mode'] || 'test'}
          onChange={(e) => onSet('payments.monri.mode', e.target.value)}
        >
          <option value="test">{t('admin.payments.mode.test')}</option>
          <option value="live">{t('admin.payments.mode.live')}</option>
        </Select>
      </Field>
    </div>
  );
}
