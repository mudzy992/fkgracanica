import { Link, Outlet } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { usePublicSettings, usePrivateSettings } from '../../hooks';
import { isModuleEnabled } from '../../lib/module-settings-rules';
import { resolveAdminModuleKey } from '../../lib/admin-module-map';
import { Button } from '../ui/button';
import { NotificationBell } from '../notifications/NotificationBell';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';
import { filterNavLeaves, type AdminNavLeaf } from './admin-nav-groups';
import { AdminSidebarNav } from './AdminSidebarNav';
import { AdminShowcaseBanner } from './AdminShowcaseBanner';

function SidebarFooter({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation();
  return (
    <Button variant="ghost" className="w-full shrink-0 justify-start gap-2" onClick={onLogout}>
      <LogOut className="h-4 w-4" />
      {t('actions.logout')}
    </Button>
  );
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { data: publicSettings } = usePublicSettings();
  const { data: privateSettings } = usePrivateSettings();

  const navGroups = useMemo(() => {
    const merged = { ...publicSettings, ...privateSettings };
    const isModuleVisible = (item: AdminNavLeaf) => {
      if (item.moduleKeys?.length) {
        return item.moduleKeys.some((k) => isModuleEnabled(merged, k));
      }
      const moduleKey = resolveAdminModuleKey(item.to);
      if (!moduleKey) return true;
      return isModuleEnabled(merged, moduleKey);
    };
    return filterNavLeaves(user?.permissions, isModuleVisible);
  }, [user?.permissions, publicSettings, privateSettings]);

  const handleLogout = () => void logout();

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-background lg:flex">
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
            <div>
              <Link to="/admin" className="text-lg font-bold text-primary">
                FK Admin
              </Link>
              {user && (
                <p className="mt-1 truncate text-xs text-text-muted">
                  {user.firstName} {user.lastName}
                </p>
              )}
            </div>
            <NotificationBell admin />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <AdminSidebarNav groups={navGroups} />
          </div>
          <div className="mt-4 shrink-0 border-t border-[var(--border-subtle)] pt-4">
            <SidebarFooter onLogout={handleLogout} />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-background px-4 lg:hidden">
          <Link to="/admin" className="font-bold text-primary">
            FK Admin
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell admin />
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <div className="flex h-full flex-col">
            <SheetHeader onClose={() => setOpen(false)}>Admin</SheetHeader>
            <SheetContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <AdminSidebarNav groups={navGroups} onNavigate={() => setOpen(false)} />
              </div>
              <div className="mt-4 shrink-0 border-t border-[var(--border-subtle)] pt-4">
                <SidebarFooter onLogout={handleLogout} />
              </div>
            </SheetContent>
          </div>
        </Sheet>

        <AdminShowcaseBanner />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
