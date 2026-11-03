import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export type BreadcrumbItem = {
  label: string;
  /** Bez `to` = trenutna stranica (nije link). */
  to?: string;
};

/**
 * Putanja do trenutne stranice u adminu (P-FE05-4).
 *
 * Detalj stranice (klub, sezona, CMS stranica, izvještaj) nemaju stavku u meniju,
 * pa bez ovoga korisnik ne vidi gdje je — samo „← Nazad". Zadnja stavka je
 * `aria-current="page"` i nije link.
 */
export function AdminBreadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  const { t } = useTranslation();
  if (!items.length) return null;

  return (
    <nav aria-label={t('admin.breadcrumb', 'Putanja')} className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 && <ChevronRight aria-hidden className="h-3 w-3 shrink-0 opacity-60" />}
              {last || !item.to ? (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={cn('truncate', last && 'font-medium text-text')}
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="truncate rounded hover:text-primary hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Prva dva nivoa su uvijek ista: Admin / <grupa>. */
export function adminRootCrumbs(groupLabel?: string): BreadcrumbItem[] {
  return groupLabel
    ? [{ label: 'Admin', to: '/admin' }, { label: groupLabel }]
    : [{ label: 'Admin', to: '/admin' }];
}
