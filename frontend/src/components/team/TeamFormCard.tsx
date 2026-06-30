import { Users } from 'lucide-react';
import type { ClubSeasonStats } from '../../types/club-hub';
import { FormResultChips } from '../public/league/FormResultChips';
import { cn } from '../../lib/utils';

export function TeamFormCard({
  standing,
  className,
}: {
  standing: NonNullable<ClubSeasonStats['standing']>;
  className?: string;
}) {
  return (
    <div className={cn('glass-premium rounded-2xl p-5', className)}>
      <Users size={18} className="mb-3 text-primary-light" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Forma</p>
      <p className="mt-1 text-[10px] leading-relaxed text-white/35">
        Zadnjih 5 ligaških utakmica u sezoni
      </p>
      <div className="mt-4">
        <FormResultChips
          form={standing.form}
          formMatches={standing.formMatches}
          clubName={standing.clubName}
          size="md"
        />
      </div>
    </div>
  );
}
