import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminPageShell } from '../../components/admin/AdminPageShell';
import { TicketingOrdersTab } from './ticketing/TicketingOrdersTab';
import { TicketingSettingsTab } from './ticketing/TicketingSettingsTab';
import { TicketingPaymentsTab } from './ticketing/TicketingPaymentsTab';
import { TicketingSeasonTab } from './ticketing/TicketingSeasonTab';
import { useTranslation } from 'react-i18next';

type Tab = 'orders' | 'settings' | 'payments' | 'season';

const TABS: { key: Tab; label: string }[] = [
  { key: 'orders', label: 'Narudžbe' },
  { key: 'season', label: 'Sezona' },
  { key: 'settings', label: 'Postavke' },
  { key: 'payments', label: 'Online plaćanje' },
];

export function TicketingAdminPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const initialTab = (location.state as { tab?: Tab } | null)?.tab ?? 'orders';
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <>
      <Seo title={t('admin.ticketing')} />
      <AdminPageShell
        title={t('admin.ticketing')}
        actions={
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Button
                key={t.key}
                size="sm"
                variant={tab === t.key ? 'default' : 'outline'}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        }
      >
        {tab === 'orders' && <TicketingOrdersTab />}
        {tab === 'season' && <TicketingSeasonTab />}
        {tab === 'settings' && <TicketingSettingsTab />}
        {tab === 'payments' && <TicketingPaymentsTab />}
      </AdminPageShell>
    </>
  );
}
