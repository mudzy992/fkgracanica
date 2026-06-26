import { mediaUrl } from '../../../lib/media';
import { POSITION_LABELS } from '../../../lib/player-utils';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { cn } from '../../../lib/utils';
import { PitchMarkings } from './PitchMarkings';

interface Props {
  slots: ClubSquadSlot[];
  horizontal?: boolean;
  onSlotClick?: (slot: ClubSquadSlot) => void;
  editable?: boolean;
}

export function FormationPitch({ slots, horizontal = true, onSlotClick, editable }: Props) {
  const starters = slots.filter((s) => !s.isBench);
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200 bg-green-700 shadow-lg',
        horizontal ? 'aspect-[16/9] w-full' : 'aspect-[3/4] max-w-md mx-auto',
      )}
    >
      <PitchMarkings horizontal={horizontal} />
      {starters.map((slot) => (
        <button
          key={slot.id}
          type="button"
          disabled={!editable && !onSlotClick}
          onClick={() => onSlotClick?.(slot)}
          className={cn(
            'absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center',
            editable && 'cursor-pointer',
          )}
          style={{ left: `${slot.positionX}%`, top: `${slot.positionY}%` }}
        >
          {slot.player?.photoPath ? (
            <img
              src={mediaUrl(slot.player.photoPath, 'thumb')}
              alt=""
              className="h-9 w-9 rounded-full border-2 border-white object-cover md:h-11 md:w-11"
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
        </button>
      ))}
    </div>
  );
}
