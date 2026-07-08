import { mediaUrl } from '../../../lib/media';
import { clubCrestPath } from '../../../lib/club-utils';
import { POSITION_LABELS } from '../../../lib/player-utils';
import type { Club } from '../../../types';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { cn } from '../../../lib/utils';

interface Props {
  slot: ClubSquadSlot;
  vertical?: boolean;
  editable?: boolean;
  onClick?: () => void;
  /** Live skica: umjesto broja/inicijala prikaži grb kluba. */
  crestFallback?: Pick<Club, 'name' | 'crestPath' | 'logoPath'> | null;
  /** Manji avatar + ime (live). */
  compact?: boolean;
}

export function PitchPlayerToken({
  slot,
  vertical,
  editable,
  onClick,
  crestFallback,
  compact,
}: Props) {
  const label = slot.player
    ? `${slot.player.firstName[0]}. ${slot.player.lastName}`
    : POSITION_LABELS[slot.lineRole as keyof typeof POSITION_LABELS];

  const crest = clubCrestPath(crestFallback);
  const avatar = compact
    ? 'h-7 w-7 rounded-full border-2 border-white object-cover md:h-8 md:w-8'
    : 'h-9 w-9 rounded-full border-2 border-white object-cover md:h-11 md:w-11';
  const crestImg = compact
    ? 'h-7 w-7 rounded-full border-2 border-white bg-white/95 object-contain p-0.5 md:h-8 md:w-8'
    : 'h-9 w-9 rounded-full border-2 border-white bg-white/95 object-contain p-0.5 md:h-11 md:w-11';
  const placeholder = compact
    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white md:h-8 md:w-8 md:text-[9px]'
    : 'flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white md:h-11 md:w-11 md:text-xs';

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
          vertical && (compact ? 'size-7 md:size-8' : 'size-9 md:size-11'),
        )}
      >
        <div className={cn(vertical && 'origin-center')}>
          {slot.player?.photoPath ? (
            <img src={mediaUrl(slot.player.photoPath, 'thumb')} alt="" className={avatar} />
          ) : crest ? (
            <img
              src={mediaUrl(crest, 'thumb')}
              alt={crestFallback?.name ?? ''}
              className={crestImg}
            />
          ) : (
            <div className={placeholder}>
              {slot.player?.number ??
                POSITION_LABELS[slot.lineRole as keyof typeof POSITION_LABELS]?.slice(0, 2) ??
                '?'}
            </div>
          )}
        </div>
      </div>
      <span
        className={cn(
          'truncate text-center font-medium leading-tight text-white',
          compact
            ? 'max-w-[3.75rem] text-[8px] md:max-w-[4.25rem] md:text-[9px]'
            : 'max-w-[4.5rem] text-[9px] md:max-w-20 md:text-[10px]',
          vertical && 'mt-0.5',
        )}
      >
        {label}
      </span>
    </button>
  );
}
