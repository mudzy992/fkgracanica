import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, LogOut, Search } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { usePublicSettings, usePrivateSettings } from '../../hooks';
import { isModuleEnabled } from '../../lib/module-settings-rules';
import { resolveAdminModuleKey } from '../../lib/admin-module-map';
import { Button } from '../ui/button';
import { NotificationBell } from '../notifications/NotificationBell';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { RouteLoading } from '../common/RouteLoading';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';
import { filterNavLeaves, type AdminNavLeaf } from './admin-nav-groups';
import { AdminSidebarNav } from './AdminSidebarNav';
import { AdminShowcaseBanner } from './AdminShowcaseBanner';
import { AdminCommandPalette } from './AdminCommandPalette';

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
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
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
              <Link to="/admin" className="text-lg font-bold text-primary-light">
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
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="mb-3 flex shrink-0 items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-2.5 py-2 text-left text-sm text-text-muted transition-colors hover:bg-surface"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search aria-hidden className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              {t('admin.cmdkPlaceholder', 'Traži stranicu ili akciju…')}
            </span>
            <kbd aria-hidden className="shrink-0 rounded border border-[var(--border-subtle)] px-1 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>
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
          <Link to="/admin" className="font-bold text-primary-light">
            FK Admin
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell admin />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('admin.cmdkTitle', 'Pretraga admina')}
              onClick={() => setPaletteOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('admin.openMenu', 'Otvori meni')}
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <div className="flex h-full flex-col">
            <SheetHeader onClose={() => setOpen(false)}>
              {t('admin.navGroup.overview', 'Admin')}
            </SheetHeader>
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

        <AdminCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={navGroups} />
        <AdminShowcaseBanner />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<RouteLoading />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
