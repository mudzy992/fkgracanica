import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublicSettings, useModuleFlags } from '../../hooks';
import { useDynamicFavicon } from '../../hooks/use-dynamic-favicon';
import { useTrackPublicVisit } from '../../hooks/use-track-public-visit';
import { useCmsMenu, useCmsPage } from '../../hooks/use-cms-pages';
import { filterPathsByModule } from '../../lib/route-module-map';
import { isModuleEnabled } from '../../lib/module-settings-rules';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { buttonVariants } from '../ui/button-variants';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';
import { PublicFooter } from './PublicFooter';
import { PublicAuthButton } from './PublicAuthButton';
import { PublicNavItems, useFallbackNavItems } from './PublicNavItems';
import { LanguageSwitcher } from './LanguageSwitcher';
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
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { data: settings } = usePublicSettings();
  const { data: moduleFlags } = useModuleFlags();
  const crestUrl = settings?.['club.crestUrl'];
  const clubName = settings?.['club.name'] ?? 'FK Gračanica';
  const tagline = settings?.['club.tagline'];
  useDynamicFavicon(crestUrl || undefined);
  useTrackPublicVisit();
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header
        className={cn(
          'fixed top-0 z-40 w-full transition-all duration-500',
          scrolled
            ? 'border-b border-[var(--border-subtle)] bg-background/95 shadow-lg shadow-primary/5 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <PublicSiteLogo crestUrl={crestUrl} clubName={clubName} light />
          <nav className="hidden items-center gap-1 xl:flex">
            <PublicNavItems items={navItems} premium />
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:block" />
            <div className="hidden lg:block">
              <PublicAuthButton />
            </div>
            <Link
              to="/pretraga"
              aria-label={t('nav.search')}
              className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            >
              <Search aria-hidden className="h-5 w-5" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={t('nav.openMenu', 'Otvori meni')}
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen} side="right">
        <SheetHeader onClose={() => setOpen(false)}>{t('footer.menu')}</SheetHeader>
        <SheetContent>
          <div className="mb-6 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <PublicSiteLogo crestUrl={crestUrl} clubName={clubName} light />
            {tagline && <p className="text-xs text-text-muted">{tagline}</p>}
          </div>
          <nav className="flex flex-col gap-1">
            <PublicNavItems items={navItems} onNavigate={() => setOpen(false)} mobile />
            <LanguageSwitcher className="mt-2" />
          </nav>
          <div className="mt-6 border-t border-[var(--border-subtle)] pt-4 lg:hidden">
            <PublicAuthButton mobile onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <PublicFooter
        clubName={clubName}
        crestUrl={crestUrl}
        footerText={footerText}
        navItems={navItems}
      />
    </div>
  );
}
