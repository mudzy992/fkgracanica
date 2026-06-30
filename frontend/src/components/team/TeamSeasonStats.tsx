import { Target, Trophy, TrendingUp } from 'lucide-react';
import type { ClubSeasonStats } from '../../types/club-hub';
import { PlayerLink } from '../public/players/PlayerLink';
import { NewsSectionTitle } from '../news/NewsSectionTitle';
import { TeamFormCard } from './TeamFormCard';
import { cn } from '../../lib/utils';

function StatKpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className={cn('glass-premium rounded-2xl p-5', accent && 'border-gradient-club glow-blue')}>
      <Icon size={18} className="mb-3 text-primary-light" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="font-display mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function sortedPlayers(stats: ClubSeasonStats) {
  return [...stats.players.filter((p) => p.stats)].sort((a, b) => {
    const gA = a.stats?.goals ?? 0;
    const gB = b.stats?.goals ?? 0;
    if (gB !== gA) return gB - gA;
    const aA = a.stats?.assists ?? 0;
    const aB = b.stats?.assists ?? 0;
    if (aB !== aA) return aB - aA;
    return (b.stats?.appearances ?? 0) - (a.stats?.appearances ?? 0);
  });
}

export function TeamSeasonStats({ stats }: { stats?: ClubSeasonStats | null }) {
  if (!stats?.season) {
    return (
      <section>
        <NewsSectionTitle>Statistike sezone</NewsSectionTitle>
        <p className="text-center text-sm text-text-muted">Statistike za aktivnu sezonu nisu dostupne.</p>
      </section>
    );
  }

  const { standing, totals } = stats;
  const rows = sortedPlayers(stats);

  return (
    <section className="space-y-8">
      <NewsSectionTitle>Statistike sezone</NewsSectionTitle>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatKpi icon={Trophy} label="Sezona" value={stats.season.name} accent />
        {standing && (
          <>
            <StatKpi icon={TrendingUp} label="Bodovi" value={standing.points} />
            <StatKpi
              icon={Target}
              label="Gol razlika"
              value={`${standing.goalsFor}:${standing.goalsAgainst}`}
            />
            <TeamFormCard standing={standing} />
          </>
        )}
      </div>

      {standing && (
        <div className="glass-premium grid grid-cols-2 gap-3 rounded-2xl p-4 text-center sm:grid-cols-4 sm:text-left">
          {[
            ['Odigrano', standing.played],
            ['Pobjede', standing.won],
            ['Neriješeno', standing.drawn],
            ['Porazi', standing.lost],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
              <p className="font-display mt-1 text-lg font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="glass-premium grid grid-cols-2 gap-4 rounded-2xl p-5 sm:grid-cols-5">
        {[
          ['Golovi', totals.goals],
          ['Asist.', totals.assists],
          ['Nastupi', totals.appearances],
          ['Žuti', totals.yellowCards],
          ['Crveni', totals.redCards],
        ].map(([label, value]) => (
          <div key={label} className="text-center sm:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
            <p className="font-display mt-1 text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="border-gradient-club glass-premium overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">
                  <th className="p-4">Igrač</th>
                  <th className="p-4">Utakm.</th>
                  <th className="p-4">Golovi</th>
                  <th className="p-4">Asist.</th>
                  <th className="p-4">Ž/K</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <tr
                    key={p.id}
                    className={cn(
                      'border-b border-white/5 transition hover:bg-white/5',
                      i === 0 && (p.stats?.goals ?? 0) > 0 && 'bg-primary/5',
                    )}
                  >
                    <td className="p-4">
                      <PlayerLink id={p.id} name={`${p.firstName} ${p.lastName}`} />
                    </td>
                    <td className="p-4 text-white/70">{p.stats?.appearances ?? 0}</td>
                    <td className="p-4 font-display font-bold text-primary-light">{p.stats?.goals ?? 0}</td>
                    <td className="p-4 text-white/70">{p.stats?.assists ?? 0}</td>
                    <td className="p-4 text-white/70">
                      {p.stats?.yellowCards ?? 0}/{p.stats?.redCards ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
