import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
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
  const badge = providerGateBadge(gate);
  const prefix = `payments.${id}`;
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">{label}</h3>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <label className="mb-3 flex items-center gap-2 text-sm">
        <Switch
          checked={settings[`${prefix}.enabled`] === 'true'}
          onCheckedChange={(v) => onSet(`${prefix}.enabled`, String(v))}
        />
        Omogućen
      </label>
      {id === 'stripe' && <StripeFields settings={settings} onSet={onSet} />}
      {id === 'paypal' && <PaypalFields settings={settings} onSet={onSet} />}
      {id === 'monri' && <MonriFields settings={settings} onSet={onSet} />}
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
  return (
    <div className="space-y-2">
      <Input
        placeholder="Publishable key"
        value={settings['payments.stripe.publishableKey'] ?? ''}
        onChange={(e) => onSet('payments.stripe.publishableKey', e.target.value)}
      />
      <Input
        placeholder="Secret key"
        type="password"
        value={settings['payments.stripe.secretKey'] ?? ''}
        onChange={(e) => onSet('payments.stripe.secretKey', e.target.value)}
      />
      <Input
        placeholder="Webhook secret"
        type="password"
        value={settings['payments.stripe.webhookSecret'] ?? ''}
        onChange={(e) => onSet('payments.stripe.webhookSecret', e.target.value)}
      />
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
  return (
    <div className="space-y-2">
      <Input
        placeholder="Client ID"
        value={settings['payments.paypal.clientId'] ?? ''}
        onChange={(e) => onSet('payments.paypal.clientId', e.target.value)}
      />
      <Input
        placeholder="Client secret"
        type="password"
        value={settings['payments.paypal.clientSecret'] ?? ''}
        onChange={(e) => onSet('payments.paypal.clientSecret', e.target.value)}
      />
      <select
        className="flex h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm"
        value={settings['payments.paypal.mode'] || 'sandbox'}
        onChange={(e) => onSet('payments.paypal.mode', e.target.value)}
      >
        <option value="sandbox">sandbox</option>
        <option value="live">live</option>
      </select>
      <Input
        placeholder="Currency (default EUR)"
        value={settings['payments.paypal.currency'] ?? 'EUR'}
        onChange={(e) => onSet('payments.paypal.currency', e.target.value)}
      />
      <Input
        placeholder="Webhook ID (opciono)"
        value={settings['payments.paypal.webhookId'] ?? ''}
        onChange={(e) => onSet('payments.paypal.webhookId', e.target.value)}
      />
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
  return (
    <div className="space-y-2">
      <Input
        placeholder="Merchant key"
        value={settings['payments.monri.merchantKey'] ?? ''}
        onChange={(e) => onSet('payments.monri.merchantKey', e.target.value)}
      />
      <Input
        placeholder="Authenticity token"
        type="password"
        value={settings['payments.monri.authenticationKey'] ?? ''}
        onChange={(e) => onSet('payments.monri.authenticationKey', e.target.value)}
      />
      <select
        className="flex h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm"
        value={settings['payments.monri.mode'] || 'test'}
        onChange={(e) => onSet('payments.monri.mode', e.target.value)}
      >
        <option value="test">test</option>
        <option value="live">live</option>
      </select>
    </div>
  );
}
