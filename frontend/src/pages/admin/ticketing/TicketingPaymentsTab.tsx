import { useEffect, useState } from 'react';
import { useTicketingAdminConfig, useUpdateTicketingAdminConfig } from '../../../hooks/use-ticketing-admin';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';

const PROVIDERS = [
  { id: 'stripe', label: 'Stripe' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'monri', label: 'Monri' },
] as const;

export function TicketingPaymentsTab() {
  const { data, isLoading } = useTicketingAdminConfig();
  const save = useUpdateTicketingAdminConfig();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [onlineEnabled, setOnlineEnabled] = useState(false);
  const [membershipOnline, setMembershipOnline] = useState(false);
  const [membershipPrice, setMembershipPrice] = useState('50');
  const [defaultProvider, setDefaultProvider] = useState('stripe');

  useEffect(() => {
    if (!data) return;
    setSettings(data.settings);
    setOnlineEnabled(data.settings['ticketing.onlineEnabled'] === 'true');
    setMembershipOnline(data.settings['membership.onlineEnabled'] === 'true');
    setMembershipPrice(data.settings['membership.annualPrice'] || '50');
    setDefaultProvider(data.settings['payments.defaultProvider'] || 'stripe');
  }, [data]);

  const set = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const onSave = () => {
    void save.mutateAsync({
      ...settings,
      'ticketing.onlineEnabled': String(onlineEnabled),
      'membership.onlineEnabled': String(membershipOnline),
      'membership.annualPrice': membershipPrice,
      'payments.defaultProvider': defaultProvider,
    });
  };

  if (isLoading || !data) return <p className="p-4 text-sm text-text-muted">Učitavanje...</p>;

  const canEnableOnline = data.onlineReady;

  return (
    <div className="space-y-6 p-4">
      <div className="rounded-lg border border-[var(--border-subtle)] p-4">
        <p className="text-sm font-medium">Status online plaćanja</p>
        <Badge className="mt-2" variant={data.onlineReady ? 'success' : 'muted'}>
          {data.onlineReady ? 'Spremno' : 'Nije konfigurisano'}
        </Badge>
      </div>

      <div className="rounded-lg border border-[var(--border-subtle)] bg-surface/50 p-4 text-sm text-text-muted">
        <p className="font-medium text-text">Stripe test (demo)</p>
        <p className="mt-2">
          U Stripe Dashboardu uključite Test mode i unesite pk_test i sk_test ključeve. Test kartica:{' '}
          <strong>4242 4242 4242 4242</strong>.
        </p>
        <p className="mt-2 text-xs">
          Webhook lokalno: stripe listen --forward-to localhost:3000/payments/webhooks/stripe
        </p>
      </div>

      <label className={`flex items-center gap-2 text-sm ${!canEnableOnline ? 'opacity-60' : ''}`}>
        <Switch
          checked={onlineEnabled && canEnableOnline}
          disabled={!canEnableOnline}
          onCheckedChange={setOnlineEnabled}
        />
        Online kupovina ulaznica
      </label>
      {!canEnableOnline && (
        <p className="text-xs text-text-muted">Popunite i omogućite barem jednog providera ispod.</p>
      )}

      <label className={`flex items-center gap-2 text-sm ${!canEnableOnline ? 'opacity-60' : ''}`}>
        <Switch
          checked={membershipOnline && canEnableOnline}
          disabled={!canEnableOnline}
          onCheckedChange={setMembershipOnline}
        />
        Online kupovina članstva
      </label>
      <div>
        <label className="mb-1 block text-sm text-text-muted">Godišnja članarina (KM)</label>
        <Input value={membershipPrice} onChange={(e) => setMembershipPrice(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-muted">Default provider</label>
        <select
          className="flex h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm"
          value={defaultProvider}
          onChange={(e) => setDefaultProvider(e.target.value)}
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {PROVIDERS.map((p) => (
        <div key={p.id} className="rounded-lg border border-[var(--border-subtle)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">{p.label}</h3>
            <Badge variant={data.providerStatus[p.id] ? 'success' : 'muted'}>
              {data.providerStatus[p.id] ? 'OK' : 'Nedostaje'}
            </Badge>
          </div>
          <label className="mb-3 flex items-center gap-2 text-sm">
            <Switch
              checked={settings[`payments.${p.id}.enabled`] === 'true'}
              onCheckedChange={(v) => set(`payments.${p.id}.enabled`, String(v))}
            />
            Omogućen
          </label>
          {p.id === 'stripe' && (
            <div className="space-y-2">
              <Input placeholder="Publishable key" value={settings['payments.stripe.publishableKey'] ?? ''} onChange={(e) => set('payments.stripe.publishableKey', e.target.value)} />
              <Input placeholder="Secret key" type="password" value={settings['payments.stripe.secretKey'] ?? ''} onChange={(e) => set('payments.stripe.secretKey', e.target.value)} />
              <Input placeholder="Webhook secret" type="password" value={settings['payments.stripe.webhookSecret'] ?? ''} onChange={(e) => set('payments.stripe.webhookSecret', e.target.value)} />
            </div>
          )}
          {p.id === 'paypal' && (
            <div className="space-y-2">
              <Input placeholder="Client ID" value={settings['payments.paypal.clientId'] ?? ''} onChange={(e) => set('payments.paypal.clientId', e.target.value)} />
              <Input placeholder="Client secret" type="password" value={settings['payments.paypal.clientSecret'] ?? ''} onChange={(e) => set('payments.paypal.clientSecret', e.target.value)} />
            </div>
          )}
          {p.id === 'monri' && (
            <div className="space-y-2">
              <Input placeholder="Merchant key" value={settings['payments.monri.merchantKey'] ?? ''} onChange={(e) => set('payments.monri.merchantKey', e.target.value)} />
              <Input placeholder="Authentication key" type="password" value={settings['payments.monri.authenticationKey'] ?? ''} onChange={(e) => set('payments.monri.authenticationKey', e.target.value)} />
            </div>
          )}
        </div>
      ))}

      <Button onClick={onSave} disabled={save.isPending}>
        {save.isPending ? 'Spremanje...' : 'Spremi plaćanje'}
      </Button>
    </div>
  );
}
