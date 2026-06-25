import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { widgetMeta } from '../../../cms/widgets/schemas';
import type { CmsPageSection } from '../../../cms/types';
import { cn } from '../../../lib/utils';

interface Props {
  sections: CmsPageSection[];
  selectedId: string | null;
  onSelect: (section: CmsPageSection) => void;
  onReorder: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

function SortableRow({
  section,
  index,
  selected,
  onSelect,
  onDelete,
}: {
  section: CmsPageSection;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const label = widgetMeta[section.widgetType as keyof typeof widgetMeta]?.label ?? section.widgetType;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-lg border p-2',
        selected ? 'border-primary bg-primary/5' : 'border-slate-200 bg-background',
        isDragging && 'opacity-60 shadow-md',
      )}
    >
      <button type="button" className="cursor-grab text-text-muted hover:text-text" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <button type="button" className="flex flex-1 items-center gap-2 text-left" onClick={onSelect}>
        <Badge variant="muted">{label}</Badge>
        <span className="text-xs text-text-muted">#{index + 1}</span>
      </button>
      <Button size="sm" variant="outline" className="text-danger" onClick={onDelete}>
        Obriši
      </Button>
    </div>
  );
}

export function CmsSortableSections({ sections, selectedId, onSelect, onReorder, onDelete }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...sections];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onReorder(next.map((s) => s.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sections.map((s, i) => (
            <SortableRow
              key={s.id}
              section={s}
              index={i}
              selected={selectedId === s.id}
              onSelect={() => onSelect(s)}
              onDelete={() => onDelete(s.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
