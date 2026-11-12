import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui/card';
import { Select } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
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
      <Select
        value={id}
        onChange={(e) => setId(e.target.value)}
      >
        <option value="">{t('admin.playerPanel.selectPlayer')}</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.firstName} {p.lastName}
          </option>
        ))}
      </Select>

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
              <Card
                key={s.label}
                className="bg-surface/50 px-3 py-2 text-center"
              >
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{s.value}</p>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-[var(--border-subtle)] text-left text-xs text-text-muted">
                  <TableHead className="px-4 py-2">{t('admin.playerPanel.season')}</TableHead>
                  <TableHead className="px-4 py-2 text-right">N</TableHead>
                  <TableHead className="px-4 py-2 text-right">G</TableHead>
                  <TableHead className="px-4 py-2 text-right">A</TableHead>
                  <TableHead className="px-4 py-2 text-right">{t('admin.playerPanel.minutes')}</TableHead>
                  <TableHead className="px-4 py-2 text-right">🟨</TableHead>
                  <TableHead className="px-4 py-2 text-right">🟥</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.seasons.map((row) => (
                  <TableRow
                    key={row.seasonId}
                    className="border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <TableCell className="px-4 py-2">{seasonName(row.seasonId)}</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums">{row.appearances}</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums">{row.goals}</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums">{row.assists}</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums">{row.minutes}</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums">{row.yellowCards}</TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums">{row.redCards}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
