'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Menu, LogOut, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { hasAnyPermission } from '../../lib/permissions';
import { ADMIN_NAV_GROUPS } from './admin-nav';
import { Button } from '../ui/button';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-text">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-surface/80 px-4 backdrop-blur lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Meni"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link href="/admin" className="flex items-center gap-2 font-display font-bold text-primary-light">
            <LayoutDashboard className="h-5 w-5" />
            FK Admin
            <span className="hidden rounded-full bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-light sm:inline">
              premium
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-text-muted sm:inline">
            {user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : '—'}
          </span>
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            <LogOut className="h-4 w-4" />
            Odjava
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside
          className={`${open ? 'flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-surface/60 p-4 backdrop-blur lg:flex`}
        >
          <nav className="space-y-6">
            {ADMIN_NAV_GROUPS.map((group) => {
              const visible = group.items.filter(
                (it) => !user?.permissions || it.perms.length === 0 || hasAnyPermission(user.permissions, it.perms) || it.perms.includes('dashboard.read'),
              );
              if (!visible.length) return null;
              return (
                <div key={group.label}>
                  <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {group.label}
                  </p>
                  <ul className="space-y-1">
                    {visible.map((it) => {
                      const active = pathname === it.to;
                      return (
                        <li key={it.to}>
                          <Link
                            href={it.to}
                            className={`flex rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                              active
                                ? 'bg-primary text-white shadow-[var(--shadow-premium)]'
                                : 'text-text-muted hover:bg-surface-deep hover:text-text'
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            {it.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
          <div className="mt-auto pt-6">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface-deep p-4">
              <p className="text-xs font-semibold">P-DASH-01</p>
              <p className="mt-1 text-xs text-text-muted">Premium • httpOnly • Turbopack</p>
              <p className="mt-1 text-[10px] font-mono text-text-muted">admin_first · S-relaxed</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
