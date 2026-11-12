import { useEffect, useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminPageShell } from '../../components/admin/AdminPageShell';
import { UsersPage } from './UsersPage';
import { RolesPage } from './RolesPage';

type Tab = 'users' | 'roles';

function resolveTab(
  param: string | null,
  canUsers: boolean,
  canRoles: boolean,
): Tab {
  if (param === 'roles' && canRoles) return 'roles';
  if (param === 'users' && canUsers) return 'users';
  if (canUsers) return 'users';
  return 'roles';
}

export function UsersRolesPage() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canUsers = hasPermission(perms, 'users.read');
  const canRoles = hasPermission(perms, 'rbac.read');
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = useMemo(() => {
    const list: { key: Tab; label: string }[] = [];
    if (canUsers) list.push({ key: 'users', label: t('admin.users') });
    if (canRoles) list.push({ key: 'roles', label: t('admin.roles') });
    return list;
  }, [canUsers, canRoles, t]);

  const tabParam = searchParams.get('tab');
  const activeTab = resolveTab(tabParam, canUsers, canRoles);
  const hasTab = canUsers || canRoles;

  useEffect(() => {
    // P-FE06-29/30: bez ijednog taba preusmjeravanje ispod mora ostati na snazi —
    // upis `?tab=` bi ga poništio i ostavio praznu stranicu.
    if (!hasTab) return;
    if (tabParam !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [hasTab, tabParam, activeTab, setSearchParams]);

  if (!hasTab) return <Navigate to="/admin" replace />;

  const setTab = (tab: Tab) => setSearchParams({ tab }, { replace: true });

  return (
    <>
      <Seo title={t('admin.usersAndRoles')} />
      <AdminPageShell
        title={t('admin.usersAndRoles')}
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
        {activeTab === 'users' && <UsersPage embedded />}
        {activeTab === 'roles' && <RolesPage embedded />}
      </AdminPageShell>
    </>
  );
}
