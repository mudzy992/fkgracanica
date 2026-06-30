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

type Tab = 'contact' | 'newsletter';

function resolveTab(
  param: string | null,
  canContact: boolean,
  canNewsletter: boolean,
): Tab {
  if (param === 'newsletter' && canNewsletter) return 'newsletter';
  if (param === 'contact' && canContact) return 'contact';
  if (canContact) return 'contact';
  return 'newsletter';
}

export function CommsAdminPage() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const { data: moduleFlags } = useModuleFlags();
  const canContact =
    hasPermission(perms, 'contact.read') && isModuleEnabled(moduleFlags, 'modules.contact');
  const canNewsletter =
    hasPermission(perms, 'newsletter.read') &&
    isModuleEnabled(moduleFlags, 'modules.newsletter');
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = useMemo(() => {
    const list: { key: Tab; label: string }[] = [];
    if (canContact) list.push({ key: 'contact', label: 'Kontakt' });
    if (canNewsletter) list.push({ key: 'newsletter', label: 'Newsletter' });
    return list;
  }, [canContact, canNewsletter]);

  if (!canContact && !canNewsletter) return <Navigate to="/admin" replace />;

  const tabParam = searchParams.get('tab');
  const activeTab = resolveTab(tabParam, canContact, canNewsletter);

  useEffect(() => {
    if (tabParam !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [tabParam, activeTab, setSearchParams]);

  const setTab = (tab: Tab) => setSearchParams({ tab }, { replace: true });

  return (
    <>
      <Seo title="Komunikacija" />
      <AdminPageShell
        title="Komunikacija"
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
      </AdminPageShell>
    </>
  );
}
