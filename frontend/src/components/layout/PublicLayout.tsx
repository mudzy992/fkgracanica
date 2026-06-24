import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';

const navItems = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/o-klubu', labelKey: 'nav.club' },
  { to: '/vijesti', labelKey: 'nav.news' },
  { to: '/galerija', labelKey: 'nav.gallery' },
  { to: '/tim', labelKey: 'nav.team' },
  { to: '/liga', labelKey: 'nav.league' },
  { to: '/sponzori', labelKey: 'nav.sponsors' },
  { to: '/trofeji', labelKey: 'nav.trophies' },
  { to: '/kontakt', labelKey: 'nav.contact' },
] as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-primary text-white' : 'text-text hover:bg-surface',
            )
          }
        >
          {t(item.labelKey)}
        </NavLink>
      ))}
    </>
  );
}

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="text-lg font-bold text-primary">
            FK Gračanica
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            <NavItems />
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
            <NavItems onNavigate={() => setOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} FK Gračanica</p>
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
