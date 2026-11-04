import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { hasStaffAccess } from '../../lib/staff-access';
import { userInitials } from '../../lib/user-initials';
import { Button } from '../ui/button';

interface Props {
  onNavigate?: () => void;
  mobile?: boolean;
}

export function PublicUserMenu({ onNavigate, mobile }: Props) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const staff = hasStaffAccess(user?.permissions);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  const menuItems = (
    <div
      className={
        mobile
          ? 'space-y-1'
          : 'absolute right-0 z-50 mt-2 min-w-44 rounded-lg border border-[var(--border-subtle)] bg-background p-1 shadow-lg'
      }
      role="menu"
    >
      <Link
        to="/clanstvo"
        role="menuitem"
        onClick={close}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text hover:bg-surface"
      >
        <User className="h-4 w-4 shrink-0" />
        {t('nav.myAccount')}
      </Link>
      {staff && (
        <Link
          to="/admin"
          role="menuitem"
          onClick={close}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text hover:bg-surface"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {t('footer.dashboard')}
        </Link>
      )}
      <button
        type="button"
        role="menuitem"
        onClick={() => void logout().then(close)}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text hover:bg-surface"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {t('actions.logout')}
      </button>
    </div>
  );

  if (mobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {userInitials(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">
              {user.firstName || user.lastName
                ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                : user.email}
            </p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
          </div>
        </div>
        {menuItems}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full p-0"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${t('nav.myAccount')}: ${userInitials(user)}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-semibold">{userInitials(user)}</span>
      </Button>
      {open && menuItems}
    </div>
  );
}
