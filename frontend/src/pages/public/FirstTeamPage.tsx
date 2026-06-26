import { groupPlayersByPosition } from '../../lib/player-utils';
import { useClubSquad, useClubStats } from '../../hooks/use-club-hub';
import { useOwnClub } from '../../hooks';
import { ClubProfileHero } from '../../components/public/clubs/ClubProfileHero';
import { FormationPitch } from '../../components/public/clubs/FormationPitch';
import { PlayerCard } from '../../components/public/players/PlayerCard';
import { ClubStatsSummary, PlayerStatsTable } from '../../components/club/ClubStatsPanels';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';
import type { Stadium } from '../../types/club-hub';

export function FirstTeamPage() {
  const { data: ownClub, isLoading: clubLoading } = useOwnClub();
  const { data: squad, isLoading: squadLoading } = useClubSquad(ownClub?.id ?? '');
  const { data: stats, isLoading: statsLoading } = useClubStats(ownClub?.id ?? '');
  const bench = squad?.slots.filter((s) => s.isBench && s.player) ?? [];
  const squadPlayers = squad?.slots.filter((s) => !s.isBench && s.player).map((s) => s.player!) ?? [];
  const groups = groupPlayersByPosition(squadPlayers);
  const isLoading = clubLoading || squadLoading;

  const clubWithStadium = ownClub
    ? {
        ...ownClub,
        stadium: (ownClub as { stadiumRel?: Stadium | null }).stadiumRel?.name ?? ownClub.stadium,
        city: (ownClub as { stadiumRel?: Stadium | null }).stadiumRel?.city ?? ownClub.city,
      }
    : null;

  return (
    <div className="pb-20">
      <Seo
        title={ownClub ? `Prvi tim — ${ownClub.name}` : 'Prvi tim'}
        description={ownClub?.description ?? 'Kadrovi prvog tima'}
      />
      <ClubProfileHero
        club={clubWithStadium}
        isLoading={clubLoading}
        eyebrow="Kadrovi"
        title="Prvi tim"
        subtitle="Formacija, klupa i statistike prvog tima."
      />

      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-12">
        {isLoading ? (
          <Skeleton className="h-[420px] w-full rounded-2xl" />
        ) : squad?.slots.length ? (
          <>
            <div className="hidden lg:block">
              <FormationPitch slots={squad.slots} horizontal />
            </div>
            <div className="lg:hidden">
              <FormationPitch slots={squad.slots} horizontal={false} />
            </div>

            {bench.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-text">Klupa</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bench.map((slot) => (
                    <PlayerCard key={slot.id} player={slot.player!} />
                  ))}
                </div>
              </section>
            )}

            {groups.map((group) => (
              <section key={group.position}>
                <h2 className="mb-4 text-xl font-bold text-text">{group.label}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.players.map((p) => (
                    <PlayerCard key={p.id} player={p} />
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : (
          <p className="py-16 text-center text-text-muted">Kadar trenutno nije objavljen.</p>
        )}

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-text">Statistike sezone</h2>
          {statsLoading ? <Skeleton className="h-32" /> : <ClubStatsSummary stats={stats} />}
          {!statsLoading && stats && <PlayerStatsTable stats={stats} />}
        </section>
      </div>
    </div>
  );
}
