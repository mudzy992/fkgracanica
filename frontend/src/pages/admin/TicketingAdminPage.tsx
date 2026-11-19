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

const TABS: { key: Tab; labelKey: string; fallback: string }[] = [
  { key: 'orders', labelKey: 'admin.ticketingTab.orders', fallback: 'Narudžbe' },
  { key: 'season', labelKey: 'admin.ticketingTab.season', fallback: 'Sezona' },
  { key: 'settings', labelKey: 'admin.ticketingTab.settings', fallback: 'Postavke' },
  { key: 'payments', labelKey: 'admin.ticketingTab.payments', fallback: 'Online plaćanje' },
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
          <div role="tablist" className="flex flex-wrap gap-2">
            {TABS.map((tabDef) => (
              <Button
                key={tabDef.key}
                role="tab"
                aria-selected={tab === tabDef.key}
                aria-pressed={tab === tabDef.key}
                size="sm"
                variant={tab === tabDef.key ? 'default' : 'outline'}
                onClick={() => setTab(tabDef.key)}
              >
                {t(tabDef.labelKey, { defaultValue: tabDef.fallback })}
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
