import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublicSettings } from '../../hooks';
import { PublicSiteLogo } from './PublicSiteLogo';

interface NavItem {
  to: string;
  label: string;
  external?: boolean;
}

interface Props {
  clubName: string;
  crestUrl?: string;
  footerText?: string;
  navItems: NavItem[];
}

export function PublicFooter({ clubName, crestUrl, footerText, navItems }: Props) {
  const { t } = useTranslation();
  const { data: settings } = usePublicSettings();
  const email = settings?.['contact.email'];
  const phone = settings?.['contact.phone'];
  const address = settings?.['contact.address'];
  const tagline = settings?.['club.tagline'];
  const quickLinks = navItems.filter((i) => !i.external).slice(0, 6);

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[image:var(--gradient-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <PublicSiteLogo crestUrl={crestUrl} clubName={clubName} />
            {tagline && <p className="text-sm text-text-muted">{tagline}</p>}
            {footerText && <p className="text-xs text-text-muted">{footerText}</p>}
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-text">{t('footer.quickLinks')}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.to + item.label}>
                  <Link to={item.to} className="text-text-muted transition hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-text">{t('footer.contact')}</h3>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-primary">
                    {email}
                  </a>
                </li>
              )}
              {phone && <li>{phone}</li>}
              {address && <li>{address}</li>}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {clubName}</p>
          <Link to="/admin/login" className="hover:text-primary">
            {t('footer.admin')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
