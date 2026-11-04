import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlayers, useSeasons } from '../../../hooks';
import { asArray } from '../../../lib/as-array';
import type { Player } from '../../../types';
import { usePlayerAnalytics } from '../../../hooks/use-analytics';

export function AnalyticsPlayerPanel() {
  const { t } = useTranslation();
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
        <option value="">{t('admin.playerPanel.selectPlayer')}</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.firstName} {p.lastName}
          </option>
        ))}
      </select>

      {isFetching && <p className="text-sm text-text-muted">{t('admin.common.loading')}</p>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 text-center text-sm">
            {[
              { label: 'Nastupi', value: data.totals.appearances },
              { label: 'Golovi', value: data.totals.goals },
              { label: 'Asistencije', value: data.totals.assists },
              { label: 'Minute', value: data.totals.minutes },
              { label: '🟨', value: data.totals.yellowCards },
              { label: '🟥', value: data.totals.redCards },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[var(--border-subtle)] bg-surface/50 px-3 py-2"
              >
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-text-muted">
                  <th className="px-4 py-2">{t('admin.playerPanel.season')}</th>
                  <th className="px-4 py-2 text-right">N</th>
                  <th className="px-4 py-2 text-right">G</th>
                  <th className="px-4 py-2 text-right">A</th>
                  <th className="px-4 py-2 text-right">{t('admin.playerPanel.minutes')}</th>
                  <th className="px-4 py-2 text-right">🟨</th>
                  <th className="px-4 py-2 text-right">🟥</th>
                </tr>
              </thead>
              <tbody>
                {data.seasons.map((row) => (
                  <tr
                    key={row.seasonId}
                    className="border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <td className="px-4 py-2">{seasonName(row.seasonId)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.appearances}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.goals}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.assists}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.minutes}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.yellowCards}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{row.redCards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
