import type { MenuDraftItem } from './menu-utils';
import { menuHref } from './menu-utils';
import { cn } from '../../../lib/utils';

interface Props {
  items: MenuDraftItem[];
}

export function CmsMenuPreviewBar({ items }: Props) {
  const visible = items.filter((i) => i.enabled);

  return (
    <div className="rounded-lg border border-slate-200 bg-background p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">Pregled menija</p>
      <div className="flex flex-wrap gap-2 rounded-lg bg-surface p-3">
        {visible.length === 0 ? (
          <span className="text-sm text-text-muted">Nema aktivnih stavki</span>
        ) : (
          visible.map((item) => (
            <span
              key={item.id ?? `${item.label}-${item.path}`}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium',
                item.isSystem ? 'bg-primary/10 text-primary' : 'bg-white text-text shadow-sm ring-1 ring-slate-200',
              )}
            >
              {item.label}
              <span className="ml-1 text-xs text-text-muted">({menuHref(item)})</span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
