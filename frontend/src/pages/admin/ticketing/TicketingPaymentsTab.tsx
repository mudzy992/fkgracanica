import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useTicketingAdminConfig,
  useUpdateTicketingAdminConfig,
} from '../../../hooks/use-ticketing-admin';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Select } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import { PaymentProviderCard } from './PaymentProviderCard';
import { PaymentProviderHints } from './PaymentProviderHints';
import { runAction } from '../../../lib/action-errors';

const PROVIDERS = [
  { id: 'stripe', label: 'Stripe' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'monri', label: 'Monri' },
] as const;

export function TicketingPaymentsTab() {
  const { t } = useTranslation();
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
    void runAction(save.mutateAsync({
      ...settings,
      'ticketing.onlineEnabled': String(onlineEnabled),
      'membership.onlineEnabled': String(membershipOnline),
      'membership.annualPrice': membershipPrice,
      'payments.defaultProvider': defaultProvider,
    }));
  };

  if (isLoading || !data)
    return <p className="p-4 text-sm text-text-muted">{t('admin.common.loading')}</p>;

  const canEnableOnline = data.onlineReady;
  const gates = {
    stripe: data.providerStatus.stripe,
    paypal: data.providerStatus.paypal,
    monri: data.providerStatus.monri,
  };

  return (
    <div className="space-y-6 p-4">
      <Card className="p-4">
        <p className="text-sm font-medium">{t('admin.ticketingPayments.status')}</p>
        <Badge className="mt-2" variant={data.onlineReady ? 'success' : 'muted'}>
          {data.onlineReady ? 'Spremno' : 'Nije konfigurisano'}
        </Badge>
      </Card>

      <PaymentProviderHints />

      <label className={`flex items-center gap-2 text-sm ${!canEnableOnline ? 'opacity-60' : ''}`}>
        <Switch
          checked={onlineEnabled && canEnableOnline}
          disabled={!canEnableOnline}
          onCheckedChange={setOnlineEnabled}
        />
        Online kupovina ulaznica
      </label>
      {!canEnableOnline && (
        <p className="text-xs text-text-muted">
          Omogućite Stripe (jedini checkout koji radi). PayPal/Monri ključevi se spremaju, naplata
          još nije spojena.
        </p>
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
        <label className="mb-1 block text-sm text-text-muted">
          {t('admin.ticketingPayments.membershipPrice')}
        </label>
        <Input value={membershipPrice} onChange={(e) => setMembershipPrice(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-muted">
          {t('admin.ticketingPayments.defaultProvider')}
        </label>
        <Select
          value={defaultProvider}
          onChange={(e) => setDefaultProvider(e.target.value)}
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>

      {PROVIDERS.map((p) => (
        <PaymentProviderCard
          key={p.id}
          id={p.id}
          label={p.label}
          gate={gates[p.id]}
          settings={settings}
          onSet={set}
        />
      ))}

      <Button onClick={onSave} disabled={save.isPending}>
        {save.isPending ? 'Spremanje...' : 'Spremi plaćanje'}
      </Button>
    </div>
  );
}
