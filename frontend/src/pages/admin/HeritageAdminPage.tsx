import { useEffect, useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useModuleFlags } from '../../hooks';
import { isModuleEnabled } from '../../lib/module-settings-rules';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminPageShell } from '../../components/admin/AdminPageShell';
import { HallOfFameAdminPage } from './HallOfFameAdminPage';
import { MuseumAdminPage } from './MuseumAdminPage';
import { useTranslation } from 'react-i18next';

type Tab = 'hall-of-fame' | 'museum';

function resolveTab(param: string | null, canHof: boolean, canMuseum: boolean): Tab {
  if (param === 'museum' && canMuseum) return 'museum';
  if (param === 'hall-of-fame' && canHof) return 'hall-of-fame';
  if (canHof) return 'hall-of-fame';
  return 'museum';
}

export function HeritageAdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const { data: moduleFlags } = useModuleFlags();
  const canHof =
    hasPermission(perms, 'hall-of-fame.manage') &&
    isModuleEnabled(moduleFlags, 'modules.hallOfFame');
  const canMuseum =
    hasPermission(perms, 'museum.manage') && isModuleEnabled(moduleFlags, 'modules.museum');
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = useMemo(() => {
    const list: { key: Tab; label: string }[] = [];
    if (canHof) list.push({ key: 'hall-of-fame', label: 'Hall of Fame' });
    if (canMuseum) list.push({ key: 'museum', label: 'Muzej' });
    return list;
  }, [canHof, canMuseum]);

  const tabParam = searchParams.get('tab');
  const activeTab = resolveTab(tabParam, canHof, canMuseum);

  useEffect(() => {
    if (tabParam !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [tabParam, activeTab, setSearchParams]);

  if (!canHof && !canMuseum) return <Navigate to="/admin" replace />;

  const setTab = (tab: Tab) => setSearchParams({ tab }, { replace: true });

  return (
    <>
      <Seo title={t('admin.heritage')} />
      <AdminPageShell
        title={t('admin.heritage')}
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
        {activeTab === 'hall-of-fame' && <HallOfFameAdminPage embedded />}
        {activeTab === 'museum' && <MuseumAdminPage embedded />}
      </AdminPageShell>
    </>
  );
}
