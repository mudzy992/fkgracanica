import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { resolvePublicModuleKey } from '../../lib/route-module-map';
import { isModuleEnabled } from '../../lib/module-settings-rules';

export const FALLBACK_NAV_KEYS = [
  { to: '/', key: 'nav.home' },
  { to: '/o-klubu', key: 'nav.club' },
  { to: '/vijesti', key: 'nav.news' },
  { to: '/galerija', key: 'nav.gallery' },
  { to: '/tim', key: 'nav.team' },
  { to: '/liga', key: 'nav.league' },
  { to: '/sponzori', key: 'nav.sponsors' },
  { to: '/trofeji', key: 'nav.trophies' },
  { to: '/kontakt', key: 'nav.contact' },
] as const;

interface NavItem {
  to: string;
  label: string;
  external?: boolean;
}

export function PublicNavItems({
  items,
  onNavigate,
  mobile,
  premium,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  mobile?: boolean;
  premium?: boolean;
}) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      premium
        ? isActive
          ? 'nav-link-premium nav-link-premium-active'
          : 'nav-link-premium'
        : cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)]',
            isActive ? 'nav-link-active text-primary-light' : 'text-text hover:bg-surface',
          ),
      mobile && 'w-full text-left !text-base !normal-case !tracking-normal',
    );

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
          <NavLink key={item.to + item.label} to={item.to} end={item.to === '/'} onClick={onNavigate} className={linkClass}>
            {item.label}
          </NavLink>
        ),
      )}
    </>
  );
}

export function useFallbackNavItems(settings?: Record<string, string>) {
  const { t } = useTranslation();
  return FALLBACK_NAV_KEYS.filter((item) => {
    const moduleKey = resolvePublicModuleKey(item.to);
    if (!moduleKey) return true;
    return isModuleEnabled(settings, moduleKey);
  }).map((item) => ({ to: item.to, label: t(item.key), external: false }));
}
