import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublicSettings, useModuleFlags } from '../../hooks';
import { useDynamicFavicon } from '../../hooks/use-dynamic-favicon';
import { useCmsMenu, useCmsPage } from '../../hooks/use-cms-pages';
import { filterPathsByModule } from '../../lib/route-module-map';
import { isModuleEnabled } from '../../lib/module-settings-rules';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';
import { PublicFooter } from './PublicFooter';
import { PublicAuthButton } from './PublicAuthButton';
import { PublicNavItems, useFallbackNavItems } from './PublicNavItems';
import { PublicSiteLogo } from './PublicSiteLogo';
import type { CmsMenuItem } from '../../cms/types';

function menuHref(item: CmsMenuItem): string {
  if (item.externalUrl) return item.externalUrl;
  if (item.path) return item.path;
  if (item.page?.slug) return item.page.slug === 'home' ? '/' : `/p/${item.page.slug}`;
  return '/';
}

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { data: settings } = usePublicSettings();
  const { data: moduleFlags } = useModuleFlags();
  const crestUrl = settings?.['club.crestUrl'];
  const clubName = settings?.['club.name'] ?? 'FK Gračanica';
  const tagline = settings?.['club.tagline'];
  useDynamicFavicon(crestUrl || undefined);
  const { data: menu } = useCmsMenu('main');
  const { data: sitePage } = useCmsPage('site');
  const fallbackNav = useFallbackNavItems(moduleFlags);

  const footerSection = sitePage?.sections?.find((s) => s.widgetType === 'footer-about');
  const footerText = String((footerSection?.config as { text?: string } | undefined)?.text ?? '');

  const navItems = useMemo(() => {
    const raw =
      menu?.items && menu.items.length > 0
        ? menu.items
            .filter((it) => it.enabled !== false)
            .map((it) => ({ to: menuHref(it), label: it.label, external: !!it.externalUrl }))
        : fallbackNav;
    return filterPathsByModule(raw, moduleFlags, isModuleEnabled);
  }, [menu?.items, fallbackNav, moduleFlags]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-background/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <PublicSiteLogo crestUrl={crestUrl} clubName={clubName} />
          <nav className="hidden items-center gap-1 lg:flex">
            <PublicNavItems items={navItems} />
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <PublicAuthButton />
            </div>
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
        <SheetHeader onClose={() => setOpen(false)}>{t('footer.menu')}</SheetHeader>
        <SheetContent>
          <div className="mb-6 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <PublicSiteLogo crestUrl={crestUrl} clubName={clubName} />
            {tagline && <p className="text-xs text-text-muted">{tagline}</p>}
          </div>
          <nav className="flex flex-col gap-1">
            <PublicNavItems items={navItems} onNavigate={() => setOpen(false)} mobile />
          </nav>
          <div className="mt-6 border-t border-[var(--border-subtle)] pt-4 lg:hidden">
            <PublicAuthButton mobile onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter clubName={clubName} crestUrl={crestUrl} footerText={footerText} navItems={navItems} />
    </div>
  );
}
