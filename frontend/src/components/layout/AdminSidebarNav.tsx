import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import type { AdminNavGroup, AdminNavLeaf } from './admin-nav-groups';

function pathMatchesItem(pathname: string, item: AdminNavLeaf): boolean {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function groupIsActive(pathname: string, group: AdminNavGroup): boolean {
  return group.items.some((item) => pathMatchesItem(pathname, item));
}

interface Props {
  groups: AdminNavGroup[];
  onNavigate?: () => void;
}

export function AdminSidebarNav({ groups, onNavigate }: Props) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const activeByGroup = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.labelKey, groupIsActive(pathname, g)])),
    [groups, pathname],
  );

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const g of groups) {
        if (activeByGroup[g.labelKey]) next[g.labelKey] = true;
      }
      return next;
    });
  }, [groups, activeByGroup]);

  const toggle = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'block rounded-lg py-2 pl-3 pr-2 text-sm transition-colors',
      isActive ? 'bg-primary font-medium text-white' : 'text-text hover:bg-surface',
    );

  return (
    <nav className="flex flex-col gap-4">
      {groups.map((group) => {
        const isOpen = openGroups[group.labelKey] ?? activeByGroup[group.labelKey];
        const singleItem = group.items.length === 1;

        if (singleItem) {
          const item = group.items[0];
          return (
            <div key={group.labelKey}>
              <NavLink
                to={item.to}
                end={item.end ?? false}
                onClick={onNavigate}
                className={linkClass}
              >
                {t(item.labelKey)}
              </NavLink>
            </div>
          );
        }

        return (
          <div key={group.labelKey}>
            <button
              type="button"
              onClick={() => toggle(group.labelKey)}
              className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t(group.labelKey)}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-text-muted transition-transform',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            {isOpen && (
              <div className="mt-1 flex flex-col gap-0.5 pl-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end ?? false}
                    onClick={onNavigate}
                    className={linkClass}
                  >
                    {t(item.labelKey)}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
