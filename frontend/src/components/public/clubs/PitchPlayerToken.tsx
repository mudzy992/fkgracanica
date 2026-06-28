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

const avatarClass =
  'h-9 w-9 rounded-full border-2 border-white object-cover md:h-11 md:w-11';

const placeholderClass =
  'flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white md:h-11 md:w-11 md:text-xs';

export function PitchPlayerToken({ slot, vertical, editable, onClick }: Props) {
  const label = slot.player
    ? `${slot.player.firstName[0]}. ${slot.player.lastName}`
    : POSITION_LABELS[slot.lineRole as keyof typeof POSITION_LABELS];

  return (
    <button
      type="button"
      disabled={!editable && !onClick}
      onClick={onClick}
      className={cn('flex flex-col items-center gap-0.5', editable && 'cursor-pointer')}
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-center',
          vertical && 'size-9 md:size-11',
        )}
      >
        <div className={cn(vertical && 'origin-center rotate-90')}>
          {slot.player?.photoPath ? (
            <img src={mediaUrl(slot.player.photoPath, 'thumb')} alt="" className={avatarClass} />
          ) : (
            <div className={placeholderClass}>
              {slot.player?.number ??
                POSITION_LABELS[slot.lineRole as keyof typeof POSITION_LABELS]?.slice(0, 2) ??
                '?'}
            </div>
          )}
        </div>
      </div>
      <span
        className={cn(
          'max-w-[4.5rem] truncate text-center text-[9px] font-medium leading-tight text-white md:max-w-20 md:text-[10px]',
          vertical && 'mt-1',
        )}
      >
        {label}
      </span>
    </button>
  );
}
