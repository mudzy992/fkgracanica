import { mediaUrl } from '../../../lib/media';
import { POSITION_LABELS } from '../../../lib/player-utils';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { cn } from '../../../lib/utils';

interface Props {
  slot: ClubSquadSlot;
  vertical?: boolean;
  editable?: boolean;
  onClick?: () => void;
}

export function PitchPlayerToken({ slot, vertical, editable, onClick }: Props) {
  const label = slot.player
    ? `${slot.player.firstName[0]}. ${slot.player.lastName}`
    : POSITION_LABELS[slot.lineRole as keyof typeof POSITION_LABELS];

  return (
    <button
      type="button"
      disabled={!editable && !onClick}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center',
        vertical && '-rotate-90',
        editable && 'cursor-pointer',
      )}
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
        {label}
      </span>
    </button>
  );
}
