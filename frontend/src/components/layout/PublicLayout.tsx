import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCmsMenu, useCmsPage } from '../../hooks/use-cms-pages';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';
import type { CmsMenuItem } from '../../cms/types';

const fallbackNav = [
  { to: '/', label: 'Početna' },
  { to: '/o-klubu', label: 'O klubu' },
  { to: '/vijesti', label: 'Vijesti' },
  { to: '/galerija', label: 'Galerija' },
  { to: '/tim', label: 'Tim' },
  { to: '/liga', label: 'Liga' },
  { to: '/sponzori', label: 'Sponzori' },
  { to: '/trofeji', label: 'Trofeji' },
  { to: '/kontakt', label: 'Kontakt' },
] as const;

function menuHref(item: CmsMenuItem): string {
  if (item.externalUrl) return item.externalUrl;
  if (item.path) return item.path;
  if (item.page?.slug) return item.page.slug === 'home' ? '/' : `/p/${item.page.slug}`;
  return '/';
}

function NavItems({ items, onNavigate }: { items: Array<{ to: string; label: string; external?: boolean }>; onNavigate?: () => void }) {
  return (
    <>
      {items.map((item) =>
        item.external ? (
          <a
            key={item.to + item.label}
            href={item.to}
            target="_blank"
            rel="noreferrer"
            onClick={onNavigate}
            className="rounded-lg px-3 py-2 text-sm font-medium text-text hover:bg-surface"
          >
            {item.label}
          </a>
        ) : (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-white' : 'text-text hover:bg-surface',
              )
            }
          >
            {item.label}
          </NavLink>
        ),
      )}
    </>
  );
}

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { data: menu } = useCmsMenu('main');
  const { data: sitePage } = useCmsPage('site');

  const footerSection = sitePage?.sections?.find((s) => s.widgetType === 'footer-about');
  const footerText = String((footerSection?.config as { text?: string } | undefined)?.text ?? '');

  const navItems =
    menu?.items && menu.items.length > 0
      ? menu.items
          .filter((it) => it.enabled !== false)
          .map((it) => ({
          to: menuHref(it),
          label: it.label,
          external: !!it.externalUrl,
        }))
      : fallbackNav.map((it) => ({ ...it, external: false }));

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="text-lg font-bold text-primary">
            FK Gračanica
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            <NavItems items={navItems} />
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/pretraga" aria-label={t('nav.search')}>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen} side="right">
        <SheetHeader onClose={() => setOpen(false)}>Meni</SheetHeader>
        <SheetContent>
          <nav className="flex flex-col gap-1">
            <NavItems items={navItems} onNavigate={() => setOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} FK Gračanica</p>
            {footerText && <p className="max-w-md text-xs">{footerText}</p>}
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/hall-of-fame" className="hover:text-primary">
              {t('nav.hallOfFame')}
            </Link>
            <Link to="/muzej" className="hover:text-primary">
              {t('nav.museum')}
            </Link>
            <Link to="/admin/login" className="hover:text-primary">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
