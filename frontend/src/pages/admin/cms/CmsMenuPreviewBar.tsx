import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import type { MenuDraftItem } from './menu-utils';
import { menuHref } from './menu-utils';
import { findBlockedMenuItems } from './menu-module-warnings';
import { cn } from '../../../lib/utils';
import { useTranslation } from 'react-i18next';

interface Props {
  items: MenuDraftItem[];
  moduleFlags?: Record<string, string>;
}

export function CmsMenuPreviewBar({ items, moduleFlags }: Props) {
  const { t } = useTranslation();
  const visible = items.filter((i) => i.enabled);
  const blocked = findBlockedMenuItems(items, moduleFlags);

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
          Pregled menija
        </p>
        <div className="flex flex-wrap gap-2 rounded-lg bg-surface p-3">
          {visible.length === 0 ? (
            <span className="text-sm text-text-muted">{t('admin.cmsMenu.noActiveItems')}</span>
          ) : (
            visible.map((item) => {
              const isBlocked = blocked.some(
                (b) => b.label === item.label && b.href === menuHref(item),
              );
              return (
                <span
                  key={item.id ?? `${item.label}-${item.path}`}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium',
                    isBlocked
                      ? 'bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/30'
                      : item.isSystem
                        ? 'bg-primary/10 text-primary'
                        : 'bg-white text-text shadow-sm ring-1 ring-[var(--border-subtle)]',
                  )}
                >
                  {item.label}
                  <span className="ml-1 text-xs opacity-70">({menuHref(item)})</span>
                  {isBlocked && (
                    <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide">
                      skriveno
                    </span>
                  )}
                </span>
              );
            })
          )}
        </div>
      </Card>

      {blocked.length > 0 && (
        <div
          role="status"
          className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <div className="min-w-0 space-y-1">
            <p className="font-medium">
              {blocked.length === 1
                ? 'Jedna aktivna stavka neće se prikazati na javnoj stranici'
                : `${blocked.length} aktivne stavke neće se prikazati na javnoj stranici`}
            </p>
            <ul className="list-inside list-disc text-xs text-amber-900/90">
              {blocked.map((b) => (
                <li key={`${b.href}-${b.moduleKey}`}>
                  <strong>{b.label}</strong> ({b.href}) — modul „{b.moduleLabel}” je isključen
                </li>
              ))}
            </ul>
            <p className="text-xs">
              Uključite module u{' '}
              <Link to="/admin/settings" className="font-semibold underline underline-offset-2">
                Postavke → Moduli
              </Link>
              , ili ugasite stavku ovdje.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
