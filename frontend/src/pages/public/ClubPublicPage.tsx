import { Link, useParams } from 'react-router-dom';
import { useClubPublic } from '../../hooks/use-club-public';
import { mediaUrl } from '../../lib/media';
import { clubCrestPath } from '../../lib/club-utils';
import { ClubStatsSummary, PlayerStatsTable } from '../../components/club/ClubStatsPanels';
import { ClubProfileHero } from '../../components/public/clubs/ClubProfileHero';
import { FormationPitch } from '../../components/public/clubs/FormationPitch';
import {
  ClubPlayersGrid,
  LastMatchLineupSection,
} from '../../components/public/clubs/ClubPublicSections';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export function ClubPublicPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useClubPublic(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }
  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Klub nije pronađen.</p>;
  }

  const { club, stadium, squad, seasonStats, players, lastMatch } = data;
  const crest = clubCrestPath(club);
  const heroClub = {
    ...club,
    stadium: stadium?.name ?? club.stadium,
    city: stadium?.city ?? club.city,
    description: club.description ?? stadium?.description,
  };

  return (
    <div className="pb-20">
      <Seo title={club.name} description={club.description ?? `Profil kluba ${club.name}`} />
      <ClubProfileHero club={heroClub} eyebrow="Klub" title={club.name} />
      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-10">
        <section className="rounded-2xl border border-slate-200/80 bg-surface/60 p-6 md:p-8">
          <div className="flex flex-wrap items-start gap-6">
            {crest && (
              <img src={mediaUrl(crest, 'medium')} alt="" className="h-24 w-24 object-contain md:h-28 md:w-28" />
            )}
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                {club.isOwnClub && <Badge variant="success">Naš klub</Badge>}
                {stadium?.city && <Badge variant="muted">{stadium.city}</Badge>}
              </div>
              {stadium && (
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div><dt className="text-text-muted">Stadion</dt><dd className="font-medium">{stadium.name}</dd></div>
                  {stadium.address && <div><dt className="text-text-muted">Adresa</dt><dd>{stadium.address}</dd></div>}
                  {stadium.capacity && <div><dt className="text-text-muted">Kapacitet</dt><dd>{stadium.capacity}</dd></div>}
                </dl>
              )}
              {club.isOwnClub && (
                <Link to="/tim" className="inline-block text-sm font-medium text-primary hover:underline">
                  Pogledaj stranicu našeg tima →
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-surface/60 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-bold">Defaultna formacija</h2>
          <FormationPitch slots={squad.slots} horizontal />
        </section>

        {lastMatch && (
          <div className="rounded-2xl border border-slate-200/80 bg-surface/60 p-6 md:p-8">
            <LastMatchLineupSection lastMatch={lastMatch} />
          </div>
        )}

        <div className="rounded-2xl border border-slate-200/80 bg-surface/60 p-6 md:p-8">
          <ClubPlayersGrid players={players} />
        </div>

        <section className="rounded-2xl border border-slate-200/80 bg-surface/60 p-6 md:p-8">
          <h2 className="mb-4 text-xl font-bold">Statistike</h2>
          <ClubStatsSummary stats={seasonStats} />
          <div className="mt-6">
            <PlayerStatsTable stats={seasonStats} />
          </div>
        </section>
      </div>
    </div>
  );
}
