import { Target, Users } from 'lucide-react';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { PlayerLink } from '../players/PlayerLink';
import { cn } from '../../../lib/utils';

type LeaderRow = { playerId: string; firstName: string; lastName: string; value: number };

function LeaderTable({
  title,
  icon: Icon,
  rows,
  valueLabel,
}: {
  title: string;
  icon: typeof Target;
  rows: LeaderRow[];
  valueLabel: string;
}) {
  if (!rows.length) {
    return (
      <div className="glass-premium rounded-2xl p-6 text-center text-sm text-text-muted">
        Nema podataka za {title.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="border-gradient-club glass-premium overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <Icon size={16} className="text-primary-light" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">
              <th className="w-12 p-4">#</th>
              <th className="p-4">Igrač</th>
              <th className="p-4 text-right">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.playerId}
                className={cn(
                  'border-b border-white/5 transition hover:bg-white/5',
                  i === 0 && row.value > 0 && 'bg-primary/5',
                )}
              >
                <td className="p-4 font-display font-bold text-white/50">{i + 1}</td>
                <td className="p-4">
                  <PlayerLink id={row.playerId} name={`${row.firstName} ${row.lastName}`} />
                </td>
                <td className="p-4 text-right font-display text-lg font-bold text-primary-light">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface Props {
  scorers?: LeaderRow[];
  assists?: LeaderRow[];
}

export function LeagueTopScorers({ scorers = [], assists = [] }: Props) {
  return (
    <section className="space-y-8">
      <div>
        <NewsSectionTitle>Najbolji strijelci</NewsSectionTitle>
        <LeaderTable title="Golovi sezone" icon={Target} rows={scorers} valueLabel="Golovi" />
      </div>
      {assists.length > 0 && (
        <div>
          <NewsSectionTitle>Asistenti</NewsSectionTitle>
          <LeaderTable title="Asistencije sezone" icon={Users} rows={assists} valueLabel="Asist." />
        </div>
      )}
    </section>
  );
}
