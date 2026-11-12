import { useEffect, useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useModuleFlags } from '../../hooks';
import { isModuleEnabled } from '../../lib/module-settings-rules';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminPageShell } from '../../components/admin/AdminPageShell';
import { ContactAdminPage } from './ContactAdminPage';
import { NewsletterAdminPage } from './NewsletterAdminPage';
import { EmailLogPanel } from './EmailLogPanel';
import { useTranslation } from 'react-i18next';

type Tab = 'contact' | 'newsletter' | 'email-log';

function resolveTab(
  param: string | null,
  canContact: boolean,
  canNewsletter: boolean,
  canEmailLog: boolean,
): Tab {
  if (param === 'newsletter' && canNewsletter) return 'newsletter';
  if (param === 'email-log' && canEmailLog) return 'email-log';
  if (param === 'contact' && canContact) return 'contact';
  if (canContact) return 'contact';
  if (canNewsletter) return 'newsletter';
  return 'email-log';
}

export function CommsAdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const { data: moduleFlags } = useModuleFlags();
  const canContact =
    hasPermission(perms, 'contact.read') && isModuleEnabled(moduleFlags, 'modules.contact');
  const canNewsletter =
    hasPermission(perms, 'newsletter.read') && isModuleEnabled(moduleFlags, 'modules.newsletter');
  const canEmailLog = hasPermission(perms, 'settings.read');
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = useMemo(() => {
    const list: { key: Tab; label: string }[] = [];
    if (canContact) list.push({ key: 'contact', label: 'Kontakt' });
    if (canNewsletter) list.push({ key: 'newsletter', label: 'Newsletter' });
    if (canEmailLog) list.push({ key: 'email-log', label: 'Email log' });
    return list;
  }, [canContact, canNewsletter, canEmailLog]);

  const tabParam = searchParams.get('tab');
  const activeTab = resolveTab(tabParam, canContact, canNewsletter, canEmailLog);
  const hasTab = canContact || canNewsletter || canEmailLog;

  useEffect(() => {
    // Bez ijednog dostupnog taba preusmjeravanje ispod mora ostati na snazi —
    // upis `?tab=` ovdje bi ga poništio i ostavio praznu stranicu.
    if (!hasTab) return;
    if (tabParam !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [hasTab, tabParam, activeTab, setSearchParams]);

  if (!hasTab) return <Navigate to="/admin" replace />;

  const setTab = (tab: Tab) => setSearchParams({ tab }, { replace: true });

  return (
    <>
      <Seo title={t('admin.comms')} />
      <AdminPageShell
        title={t('admin.comms')}
        actions={
          tabs.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {tabs.map((item) => (
                <Button
                  key={item.key}
                  size="sm"
                  variant={activeTab === item.key ? 'default' : 'outline'}
                  onClick={() => setTab(item.key)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          ) : undefined
        }
      >
        {activeTab === 'contact' && <ContactAdminPage embedded />}
        {activeTab === 'newsletter' && <NewsletterAdminPage embedded />}
        {activeTab === 'email-log' && <EmailLogPanel />}
      </AdminPageShell>
    </>
  );
}
