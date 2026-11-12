import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { AlertTriangle, GripVertical, Lock } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import type { CmsPage } from '../../../cms/types';
import { cn } from '../../../lib/utils';
import type { MenuDraftItem } from './menu-utils';
import { blockedModuleForItem } from './menu-module-warnings';

interface Props {
  items: MenuDraftItem[];
  pages: CmsPage[];
  onChange: (items: MenuDraftItem[]) => void;
  moduleFlags?: Record<string, string>;
}

function SortableMenuRow({
  item,
  index,
  pages,
  moduleFlags,
  onPatch,
  onRemove,
}: {
  item: MenuDraftItem;
  index: number;
  pages: CmsPage[];
  moduleFlags?: Record<string, string>;
  onPatch: (patch: Partial<MenuDraftItem>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const blocked = blockedModuleForItem(item, moduleFlags);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id ?? `new-${index}`,
  });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'p-3',
        blocked
          ? 'border-amber-500/40 bg-amber-500/5'
          : item.isSystem
            ? 'border-primary/20 bg-primary/5'
            : 'border-[var(--border-subtle)] bg-background',
        !item.enabled && 'opacity-50',
        isDragging && 'shadow-md',
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 cursor-grab text-text-muted"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
        {item.isSystem ? (
          <Badge variant="default" className="gap-1">
            <Lock className="h-3 w-3" /> Sistemska
          </Badge>
        ) : (
          <Badge variant="muted">{t('admin.cmsMenu.custom')}</Badge>
        )}
        {blocked && (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> Modul off
          </Badge>
        )}
        <label className="ml-auto flex items-center gap-2 text-xs">
          <span>{t('admin.cmsMenu.active')}</span>
          <Switch checked={item.enabled} onCheckedChange={(v) => onPatch({ enabled: v })} />
        </label>
      </div>
      {blocked && (
        <p className="mb-2 flex items-start gap-1.5 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            Neće se prikazati dok je modul „{blocked.moduleLabel}” isključen.{' '}
            <Link to="/admin/settings" className="font-semibold underline underline-offset-2">
              Otvori postavke
            </Link>
          </span>
        </p>
      )}
      {item.isSystem ? (
        <div className="space-y-1 text-sm">
          <p className="font-medium">{item.label}</p>
          <p className="text-xs text-text-muted">{item.path}</p>
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          <Input value={item.label} onChange={(e) => onPatch({ label: e.target.value })} placeholder={t('admin.cmsMenu.label')} />
          <Input value={item.path} onChange={(e) => onPatch({ path: e.target.value })} placeholder={t('admin.cmsMenu.path')} />
          <Select className="md:col-span-2"
            value={item.pageId ?? ''}
            onChange={(e) => {
              const pageId = e.target.value || undefined;
              const pg = pages.find((p) => p.id === pageId);
              onPatch({
                pageId,
                path: pg ? (pg.slug === 'home' ? '/' : `/p/${pg.slug}`) : item.path,
              });
            }}
          >
            <option value="">{t('admin.cmsMenu.pageOptional')}</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
          <Button variant="outline" size="sm" className="text-danger md:col-span-2" onClick={onRemove}>
            Obriši stavku
          </Button>
        </div>
      )}
    </Card>
  );
}

export function CmsMenuSortableList({ items, pages, onChange, moduleFlags }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = items.map((it, i) => it.id ?? `new-${i}`);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...items];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onChange(next.map((it, i) => ({ ...it, sortOrder: i })));
  };

  const patchAt = (index: number, patch: Partial<MenuDraftItem>) => {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item, i) => (
            <SortableMenuRow
              key={ids[i]}
              item={item}
              index={i}
              pages={pages}
              moduleFlags={moduleFlags}
              onPatch={(patch) => patchAt(i, patch)}
              onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
