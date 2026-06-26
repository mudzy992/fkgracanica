import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

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
}: {
  items: NavItem[];
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)]',
      isActive ? 'nav-link-active text-primary' : 'text-text hover:bg-surface',
      mobile && 'w-full text-left',
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

export function useFallbackNavItems() {
  const { t } = useTranslation();
  return FALLBACK_NAV_KEYS.map((item) => ({ to: item.to, label: t(item.key), external: false }));
}
