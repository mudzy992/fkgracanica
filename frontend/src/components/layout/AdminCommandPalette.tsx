import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth';
import type { AdminNavGroup } from './admin-nav-groups';
import { buildCommands, filterCommands, type Command } from './admin-command-palette';

export function AdminCommandPalette({
  open,
  onOpenChange,
  groups,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: AdminNavGroup[];
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const commands = useMemo<Command[]>(
    () => buildCommands({ groups, permissions: user?.permissions, t }),
    [groups, t, user?.permissions],
  );

  const results = useMemo(() => filterCommands(commands, query), [commands, query]);

  // globalna prečica
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // fokus tek nakon mounta portala
      const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // aktivna stavka ostaje vidljiva pri navigaciji strelicama
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = useCallback(
    (command: Command) => {
      onOpenChange(false);
      if (command.external) window.open(command.to, '_blank', 'noopener,noreferrer');
      else navigate(command.to);
    },
    [navigate, onOpenChange],
  );

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!results.length) return;
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActive((prev) => (prev + delta + results.length) % results.length);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const command = results[active];
      if (command) run(command);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('actions.close', 'Zatvori')}
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('admin.cmdkTitle', 'Pretraga admina')}
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-background shadow-xl"
      >
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-4 py-3">
          <Search aria-hidden className="h-4 w-4 shrink-0 text-text-muted" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="admin-cmdk-list"
            aria-activedescendant={results[active] ? `admin-cmdk-${active}` : undefined}
            aria-label={t('admin.cmdkTitle', 'Pretraga admina')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={t('admin.cmdkPlaceholder', 'Traži stranicu ili akciju…')}
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
          />
          <kbd className="hidden shrink-0 rounded border border-[var(--border-subtle)] px-1.5 py-0.5 text-[10px] text-text-muted sm:block">
            Esc
          </kbd>
        </div>

        <ul
          ref={listRef}
          id="admin-cmdk-list"
          role="listbox"
          aria-label={t('admin.cmdkResults', 'Rezultati')}
          className="max-h-[min(60dvh,420px)] overflow-y-auto p-2"
        >
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-text-muted">
              {t('admin.cmdkEmpty', 'Nema rezultata za „{{query}}"', { query })}
            </li>
          )}
          {results.map((command, index) => (
            <li
              key={`${command.id}-${command.to}`}
              id={`admin-cmdk-${index}`}
              data-index={index}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run(command)}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm',
                index === active ? 'bg-primary text-white' : 'text-text',
              )}
            >
              <span className="min-w-0 truncate">{command.label}</span>
              <span
                className={cn(
                  'flex shrink-0 items-center gap-1 text-[11px]',
                  index === active ? 'text-white/70' : 'text-text-muted',
                )}
              >
                {command.group}
                {index === active && <CornerDownLeft aria-hidden className="h-3 w-3" />}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
