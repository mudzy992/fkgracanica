import { mapPitchPosition } from '../../../lib/pitch-coords';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { cn } from '../../../lib/utils';
import { PitchMarkings } from './PitchMarkings';
import { PitchPlayerToken } from './PitchPlayerToken';

interface Props {
  slots: ClubSquadSlot[];
  horizontal?: boolean;
  onSlotClick?: (slot: ClubSquadSlot) => void;
  editable?: boolean;
  premium?: boolean;
}

export function FormationPitch({ slots, horizontal = true, onSlotClick, editable, premium }: Props) {
  const starters = slots.filter((s) => !s.isBench);
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl shadow-lg',
        premium
          ? 'border border-primary/20 bg-gradient-to-b from-emerald-900/95 via-emerald-800/85 to-emerald-950 shadow-[0_0_48px_rgba(0,102,255,0.12)]'
          : 'border border-slate-200 bg-green-700',
        horizontal ? 'aspect-[16/9] w-full' : 'aspect-[3/4] max-w-md mx-auto',
      )}
    >
      <PitchMarkings horizontal={horizontal} />
      {starters.map((slot) => {
        const pos = mapPitchPosition(slot.positionX, slot.positionY, horizontal);
        return (
          <div
            key={slot.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
          >
            <PitchPlayerToken
              slot={slot}
              vertical={!horizontal}
              editable={editable}
              onClick={onSlotClick ? () => onSlotClick(slot) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
