import { useState } from 'react';
import { usePlayers, useSeasons } from '../../../hooks';
import { asArray } from '../../../lib/as-array';
import type { Player } from '../../../types';
import { usePlayerAnalytics } from '../../../hooks/use-analytics';

export function AnalyticsPlayerPanel() {
  const { data: playersRaw } = usePlayers({ activeOnly: true });
  const players = asArray<Player>(playersRaw);
  const { data: seasonsRaw } = useSeasons();
  const seasons = asArray<{ id: string; name: string }>(seasonsRaw);
  const [id, setId] = useState('');
  const { data, isFetching } = usePlayerAnalytics(id || undefined);
  const seasonName = (sid: string) => seasons.find((s) => s.id === sid)?.name ?? sid;

  return (
    <div className="space-y-4">
      <select
        className="h-10 rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm"
        value={id}
        onChange={(e) => setId(e.target.value)}
      >
        <option value="">Igrač</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.firstName} {p.lastName}
          </option>
        ))}
      </select>
      {isFetching && <p className="text-sm text-text-muted">Učitavanje...</p>}
      {data && (
        <div className="space-y-3 text-sm">
          <p>
            Ukupno: {data.totals.appearances} nastupa · {data.totals.goals} golova · {data.totals.assists} asistencija
          </p>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-text-muted">
                <th className="py-2">Sezona</th>
                <th>N</th>
                <th>G</th>
                <th>A</th>
                <th>Min</th>
              </tr>
            </thead>
            <tbody>
              {data.seasons.map((row) => (
                <tr key={row.seasonId} className="border-t border-[var(--border-subtle)]">
                  <td className="py-2">{seasonName(row.seasonId)}</td>
                  <td>{row.appearances}</td>
                  <td>{row.goals}</td>
                  <td>{row.assists}</td>
                  <td>{row.minutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
