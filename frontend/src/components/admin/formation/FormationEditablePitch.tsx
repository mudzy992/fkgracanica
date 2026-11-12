import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { mediaUrl } from '../../../lib/media';
import { POSITION_LABELS } from '../../../lib/player-utils';
import { playerDndId, squadSlotDndId } from '../../../lib/formation-dnd';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';
import { mapPitchPosition } from '../../../lib/pitch-coords';
import { PitchMarkings } from '../../public/clubs/PitchMarkings';

function EditableSlot({
  slot,
  active,
  onSlotClick,
}: {
  slot: ClubSquadSlot;
  active: boolean;
  onSlotClick: (slot: ClubSquadSlot) => void;
}) {
  const dropId = squadSlotDndId(slot);
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: dropId });
  const dragId = slot.playerId ? playerDndId(slot.playerId) : null;
  const drag = useDraggable({
    id: dragId ?? `empty-${dropId}`,
    data: { playerId: slot.playerId },
    disabled: !slot.playerId,
  });

  const setRef = (node: HTMLButtonElement | null) => {
    setDropRef(node);
    drag.setNodeRef(node);
  };

  const dragStyle = drag.transform ? { transform: CSS.Translate.toString(drag.transform) } : undefined;

  return (
    <Button
      ref={setRef}
      type="button"
      variant="ghost"
      onClick={() => onSlotClick(slot)}
      {...(slot.playerId ? { ...drag.listeners, ...drag.attributes } : {})}
      className={cn(
        'absolute z-10 flex h-auto -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-lg p-1 transition-shadow hover:bg-transparent',
        slot.playerId && 'cursor-grab',
        (isOver || active) && 'ring-2 ring-yellow-300 ring-offset-1 ring-offset-green-700',
        drag.isDragging && 'opacity-50',
      )}
      style={{ left: `${slot.positionX}%`, top: `${slot.positionY}%`, ...dragStyle }}
    >
      {slot.player?.photoPath ? (
        <img
          src={mediaUrl(slot.player.photoPath, 'thumb')}
          alt=""
          className="pointer-events-none h-9 w-9 rounded-full border-2 border-white object-cover md:h-11 md:w-11"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white md:h-11 md:w-11 md:text-xs">
          {slot.player?.number ?? POSITION_LABELS[slot.lineRole as keyof typeof POSITION_LABELS]?.slice(0, 2) ?? '?'}
        </div>
      )}
      <span className="mt-0.5 max-w-16 truncate text-center text-[9px] font-medium text-white md:max-w-20 md:text-[10px]">
        {slot.player
          ? `${slot.player.firstName[0]}. ${slot.player.lastName}`
          : POSITION_LABELS[slot.lineRole as keyof typeof POSITION_LABELS]}
      </span>
    </Button>
  );
}

interface Props {
  slots: ClubSquadSlot[];
  activeSlot: ClubSquadSlot | null;
  onSlotClick: (slot: ClubSquadSlot) => void;
  horizontal?: boolean;
  pending?: boolean;
}

export function ResponsiveFormationEditablePitch(props: Omit<Props, 'horizontal'>) {
  return (
    <>
      <div className="hidden lg:block">
        <FormationEditablePitch {...props} />
      </div>
      <div className="lg:hidden">
        <FormationEditablePitch {...props} horizontal={false} />
      </div>
    </>
  );
}

export function FormationEditablePitch({ slots, activeSlot, onSlotClick, horizontal = true, pending }: Props) {
  const starters = slots.filter((s) => !s.isBench);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-green-700 shadow-lg ${
        horizontal ? 'aspect-[16/9]' : 'aspect-[3/4]'
      } ${pending ? 'opacity-70' : ''}`}
    >
      <PitchMarkings horizontal={horizontal} />
      {starters.map((slot) => {
        const pos = mapPitchPosition(slot.positionX ?? 50, slot.positionY ?? 50, horizontal);
        return (
          <EditableSlot
            key={slot.id}
            slot={{ ...slot, positionX: pos.left, positionY: pos.top }}
            active={
              activeSlot?.slotIndex === slot.slotIndex && activeSlot?.isBench === slot.isBench
            }
            onSlotClick={onSlotClick}
          />
        );
      })}
    </div>
  );
}
