import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Player } from '../../../types';
import { playerDndId } from '../../../lib/formation-dnd';
import { cn } from '../../../lib/utils';

function DraggableChip({ player }: { player: Player }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: playerDndId(player.id),
    data: { playerId: player.id },
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={cn(
        'cursor-grab rounded-full border border-slate-200 bg-background px-3 py-1.5 text-xs font-medium shadow-sm',
        isDragging && 'z-50 opacity-60 ring-2 ring-primary',
      )}
      {...listeners}
      {...attributes}
    >
      {player.number ? `${player.number} ` : ''}
      {player.firstName} {player.lastName}
    </button>
  );
}

interface Props {
  players: Player[];
}

export function FormationPlayerPool({ players }: Props) {
  if (!players.length) {
    return <p className="text-sm text-text-muted">Svi igrači su raspoređeni.</p>;
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">Dostupni igrači (povuci na teren)</h3>
      <div className="flex flex-wrap gap-2">
        {players.map((p) => (
          <DraggableChip key={p.id} player={p} />
        ))}
      </div>
    </div>
  );
}
