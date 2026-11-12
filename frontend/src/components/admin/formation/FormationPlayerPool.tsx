import { useDraggable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { CSS } from '@dnd-kit/utilities';
import type { Player } from '../../../types';
import { playerDndId } from '../../../lib/formation-dnd';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';

function DraggableChip({ player }: { player: Player }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: playerDndId(player.id),
    data: { playerId: player.id },
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <Button
      ref={setNodeRef}
      type="button"
      variant="ghost"
      style={style}
      className={cn(
        'h-auto cursor-grab rounded-full border border-[var(--border-subtle)] bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-background',
        isDragging && 'z-50 opacity-60 ring-2 ring-primary',
      )}
      {...listeners}
      {...attributes}
    >
      {player.number ? `${player.number} ` : ''}
      {player.firstName} {player.lastName}
    </Button>
  );
}

interface Props {
  players: Player[];
}

export function FormationPlayerPool({ players }: Props) {
  const { t } = useTranslation();
  if (!players.length) {
    return <p className="text-sm text-text-muted">{t('admin.formation.allAssigned')}</p>;
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{t('admin.formation.pool')}</h3>
      <div className="flex flex-wrap gap-2">
        {players.map((p) => (
          <DraggableChip key={p.id} player={p} />
        ))}
      </div>
    </div>
  );
}
