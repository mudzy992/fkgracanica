import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePublicSettings } from '../../hooks';
import { useAuth } from '../../lib/auth';
import { hasStaffAccess } from '../../lib/staff-access';
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
  const { isAuthenticated, user } = useAuth();
  const email = settings?.['contact.email'];
  const phone = settings?.['contact.phone'];
  const address = settings?.['contact.address'];
  const tagline = settings?.['club.tagline'];
  const quickLinks = navItems.filter((i) => !i.external).slice(0, 6);
  const showDashboard = isAuthenticated && hasStaffAccess(user?.permissions);

  return (
    <footer className="relative border-t border-white/10 bg-surface pt-16 pb-10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-light/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <PublicSiteLogo crestUrl={crestUrl} clubName={clubName} />
            {tagline && <p className="text-sm text-text-muted">{tagline}</p>}
            {footerText && <p className="text-xs leading-relaxed text-text-muted">{footerText}</p>}
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary-light">
              {t('footer.quickLinks')}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.to + item.label}>
                  <Link to={item.to} className="text-text-muted transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary-light">
              {t('footer.contact')}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-text-muted">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-primary-light">
                    {email}
                  </a>
                </li>
              )}
              {phone && <li>{phone}</li>}
              {address && <li>{address}</li>}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {clubName}
          </p>
          {showDashboard && (
            <Link to="/admin" className="hover:text-primary-light">
              {t('footer.dashboard')}
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
