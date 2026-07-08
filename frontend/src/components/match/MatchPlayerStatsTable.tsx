import { PlayerLink } from '../public/players/PlayerLink';
import type { PlayerMatchStat } from '../../types/match-stats';

export function MatchPlayerStatsTable({
  title,
  players,
}: {
  title: string;
  players: PlayerMatchStat[];
}) {
  if (!players.length) return null;

  const hasDetail = players.some(
    (p) => p.goals || p.ownGoals || p.assists || p.yellowCards || p.redCards || p.shots || p.shotsOn,
  );

  return (
    <div className="border-gradient-club glass-premium overflow-hidden rounded-2xl">
      <p className="border-b border-white/10 px-4 py-3 font-display text-sm font-bold uppercase tracking-wider">
        {title}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-black/[0.03] text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              <th className="p-3">Igrač</th>
              {hasDetail && (
                <>
                  <th className="p-3 text-center">G</th>
                  <th className="p-3 text-center">AG</th>
                  <th className="p-3 text-center">A</th>
                  <th className="p-3 text-center">U</th>
                  <th className="p-3 text-center">U+</th>
                  <th className="p-3 text-center">Ž/C</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.playerId} className="border-b border-white/5 last:border-0">
                <td className="p-3">
                  <PlayerLink id={p.playerId} name={`${p.firstName} ${p.lastName}`} />
                  {!p.isStarter && (
                    <span className="ml-2 text-xs text-text-muted">(rez)</span>
                  )}
                </td>
                {hasDetail && (
                  <>
                    <td className="p-3 text-center tabular-nums">{p.goals || '—'}</td>
                    <td className="p-3 text-center tabular-nums">{p.ownGoals || '—'}</td>
                    <td className="p-3 text-center tabular-nums">{p.assists || '—'}</td>
                    <td className="p-3 text-center tabular-nums">{p.shots || '—'}</td>
                    <td className="p-3 text-center tabular-nums">{p.shotsOn || '—'}</td>
                    <td className="p-3 text-center tabular-nums">
                      {p.yellowCards || p.redCards
                        ? `${p.yellowCards}/${p.redCards}`
                        : '—'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
