import type { ClubSquadResponse } from '../../types/club-hub';
import { NewsSectionTitle } from '../news/NewsSectionTitle';
import { ResponsiveFormationPitch } from '../public/clubs/ResponsiveFormationPitch';
import { formationLabel } from './team-stats-utils';

interface Props {
  squad: ClubSquadResponse;
}

export function TeamFormationSection({ squad }: Props) {
  const label = formationLabel(squad.formation);

  return (
    <section>
      <NewsSectionTitle>Startna postava</NewsSectionTitle>
      <div className="border-gradient-club glass-premium overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8">
        {label && (
          <div className="mb-5 flex justify-center">
            <span className="rounded-full border border-primary/35 bg-primary/15 px-5 py-2 font-display text-sm font-bold uppercase tracking-[0.25em] text-primary-light glow-blue">
              {label}
            </span>
          </div>
        )}
        <ResponsiveFormationPitch slots={squad.slots} premium />
      </div>
    </section>
  );
}
