import type { ClubSquadSlot } from '../../../types/club-hub';
import { FormationPitch } from './FormationPitch';

interface Props {
  slots: ClubSquadSlot[];
  onSlotClick?: (slot: ClubSquadSlot) => void;
  editable?: boolean;
  premium?: boolean;
}

export function ResponsiveFormationPitch({ slots, onSlotClick, editable, premium }: Props) {
  return (
    <>
      <div className="hidden lg:block">
        <FormationPitch slots={slots} horizontal onSlotClick={onSlotClick} editable={editable} premium={premium} />
      </div>
      <div className="lg:hidden">
        <FormationPitch slots={slots} horizontal={false} onSlotClick={onSlotClick} editable={editable} premium={premium} />
      </div>
    </>
  );
}
