import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { playerDndId, squadSlotDndId } from '../../../lib/formation-dnd';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';

interface Props {
  slot: ClubSquadSlot;
  active: boolean;
  onSelect: () => void;
}

export function BenchDropRow({ slot, active, onSelect }: Props) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: squadSlotDndId(slot) });
  const drag = useDraggable({
    id: slot.playerId ? playerDndId(slot.playerId) : `empty-bench-${slot.id}`,
    disabled: !slot.playerId,
  });

  const setRef = (node: HTMLButtonElement | null) => {
    setDropRef(node);
    drag.setNodeRef(node);
  };

  return (
    <Button
      ref={setRef}
      type="button"
      variant="ghost"
      onClick={onSelect}
      {...(slot.playerId ? { ...drag.listeners, ...drag.attributes } : {})}
      className={cn(
        'flex h-auto w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-normal hover:bg-surface',
        slot.playerId && 'cursor-grab',
        active || isOver ? 'border-primary bg-primary/5' : 'border-[var(--border-subtle)]',
        drag.isDragging && 'opacity-50',
      )}
    >
      <span>{slot.player ? `${slot.player.firstName} ${slot.player.lastName}` : 'Prazno mjesto'}</span>
      <span className="text-text-muted">#{slot.benchOrder ?? slot.slotIndex + 1}</span>
    </Button>
  );
}
