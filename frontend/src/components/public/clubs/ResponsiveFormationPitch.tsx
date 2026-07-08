import type { Club } from '../../../types';
import type { ClubSquadSlot } from '../../../types/club-hub';
import { FormationPitch } from './FormationPitch';

interface Props {
  slots: ClubSquadSlot[];
  onSlotClick?: (slot: ClubSquadSlot) => void;
  editable?: boolean;
  premium?: boolean;
  crestFallback?: Pick<Club, 'name' | 'crestPath' | 'logoPath'> | null;
  enlarged?: boolean;
  compact?: boolean;
}

export function ResponsiveFormationPitch({
  slots,
  onSlotClick,
  editable,
  premium,
  crestFallback,
  enlarged,
  compact,
}: Props) {
  return (
    <>
      <div className="hidden lg:block">
        <FormationPitch
          slots={slots}
          horizontal
          onSlotClick={onSlotClick}
          editable={editable}
          premium={premium}
          crestFallback={crestFallback}
          enlarged={enlarged}
          compact={compact}
        />
      </div>
      <div className="lg:hidden">
        <FormationPitch
          slots={slots}
          horizontal={false}
          onSlotClick={onSlotClick}
          editable={editable}
          premium={premium}
          crestFallback={crestFallback}
          enlarged={enlarged}
          compact={compact}
        />
      </div>
    </>
  );
}
