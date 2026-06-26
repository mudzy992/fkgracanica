import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../notifications/NotificationBell';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';

const adminNav = [
  { to: '/admin', labelKey: 'admin.dashboard', end: true },
  { to: '/admin/settings', labelKey: 'admin.settings' },
  { to: '/admin/users', labelKey: 'admin.users' },
  { to: '/admin/roles', labelKey: 'admin.roles' },
  { to: '/admin/cms', labelKey: 'admin.cms' },
  { to: '/admin/media', labelKey: 'admin.media' },
  { to: '/admin/audit', labelKey: 'admin.audit' },
  { to: '/admin/notifications', labelKey: 'notifications.title' },
  { to: '/admin/news', labelKey: 'admin.news' },
  { to: '/admin/gallery', labelKey: 'admin.gallery' },
  { to: '/admin/sponsors', labelKey: 'admin.sponsors' },
  { to: '/admin/trophies', labelKey: 'admin.trophies' },
  { to: '/admin/club-timeline', labelKey: 'admin.timeline' },
  { to: '/admin/clubs', labelKey: 'admin.clubSquad' },
  { to: '/admin/competitions', labelKey: 'admin.competitions' },
  { to: '/admin/matches', labelKey: 'admin.matches' },
  { to: '/admin/membership', labelKey: 'admin.membership' },
  { to: '/admin/ticketing', labelKey: 'admin.ticketing' },
  { to: '/admin/contact', labelKey: 'admin.contact' },
  { to: '/admin/newsletter', labelKey: 'admin.newsletter' },
  { to: '/admin/hall-of-fame', labelKey: 'admin.hallOfFame' },
  { to: '/admin/museum', labelKey: 'admin.museum' },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-col gap-0.5">
      {adminNav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={'end' in item ? item.end : false}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-2 text-sm transition-colors',
              isActive ? 'bg-primary text-white' : 'text-text hover:bg-surface',
            )
          }
        >
          {t(item.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-background p-4 lg:block">
        <div className="mb-6 flex items-center justify-between gap-2">
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
        <SidebarNav />
        <Button variant="ghost" className="mt-6 w-full justify-start gap-2" onClick={() => void logout()}>
          <LogOut className="h-4 w-4" />
          {t('actions.logout')}
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-background px-4 lg:hidden">
          <Link to="/admin" className="font-bold text-primary">
            FK Admin
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell admin />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          </div>
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetHeader onClose={() => setOpen(false)}>Admin</SheetHeader>
          <SheetContent>
            <SidebarNav onNavigate={() => setOpen(false)} />
            <Button
              variant="ghost"
              className="mt-4 w-full justify-start gap-2"
              onClick={() => void logout()}
            >
              <LogOut className="h-4 w-4" />
              {t('actions.logout')}
            </Button>
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
