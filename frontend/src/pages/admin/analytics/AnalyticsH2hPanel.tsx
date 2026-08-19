import { useState } from 'react';
import { useClubs } from '../../../hooks';
import { useH2H, type H2HAnalytics } from '../../../hooks/use-analytics';
import { asArray } from '../../../lib/as-array';
import type { Club } from '../../../types';

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-[var(--border-subtle)] bg-surface/50 px-4 py-2 text-center">
      <span className="text-xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function AnalyticsH2hPanel() {
  const { data: clubsRaw } = useClubs();
  const clubs = asArray<Club>(clubsRaw);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const { data, isFetching } = useH2H(a || undefined, b || undefined);

  const clubName = (id: string) => clubs.find((c) => c.id === id)?.name ?? '?';

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          className="h-10 rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm"
          value={a}
          onChange={(e) => setA(e.target.value)}
        >
          <option value="">Klub A</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          className="h-10 rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm"
          value={b}
          onChange={(e) => setB(e.target.value)}
        >
          <option value="">Klub B</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {isFetching && <p className="text-sm text-text-muted">Učitavanje...</p>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-sm">
            <div className="col-span-3 space-y-1 text-center">
              <p className="font-semibold truncate">{a ? clubName(a) : 'Klub A'}</p>
              <div className="flex justify-center gap-2">
                <StatPill label="W" value={data.clubA.wins} />
                <StatPill label="D" value={data.clubA.draws} />
                <StatPill label="L" value={data.clubA.losses} />
              </div>
            </div>
            <div className="col-span-1 flex items-center justify-center text-lg font-bold text-text-muted">
              {data.played}
            </div>
            <div className="col-span-3 space-y-1 text-center">
              <p className="font-semibold truncate">{b ? clubName(b) : 'Klub B'}</p>
              <div className="flex justify-center gap-2">
                <StatPill label="W" value={data.clubB.wins} />
                <StatPill label="D" value={data.clubB.draws} />
                <StatPill label="L" value={data.clubB.losses} />
              </div>
            </div>
          </div>

          <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] text-sm">
            {data.matches.map((m: H2HAnalytics['matches'][number]) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="w-[38%] truncate text-right text-text-muted">{m.home}</span>
                <div className="mx-3 flex min-w-[72px] flex-col items-center">
                  <span className="font-bold tabular-nums">{m.homeScore}:{m.awayScore}</span>
                  <span className="text-[10px] text-text-muted">{fmt(m.scheduledAt)}</span>
                </div>
                <span className="w-[38%] truncate text-left text-text-muted">{m.away}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
