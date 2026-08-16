import { useState } from 'react';
import { useClubs } from '../../../hooks';
import { useH2H, type H2HAnalytics } from '../../../hooks/use-analytics';
import { asArray } from '../../../lib/as-array';
import type { Club } from '../../../types';

export function AnalyticsH2hPanel() {
  const { data: clubsRaw } = useClubs();
  const clubs = asArray<Club>(clubsRaw);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const { data, isFetching } = useH2H(a || undefined, b || undefined);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="h-10 rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm" value={a} onChange={(e) => setA(e.target.value)}>
          <option value="">Klub A</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="h-10 rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-sm" value={b} onChange={(e) => setB(e.target.value)}>
          <option value="">Klub B</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {isFetching && <p className="text-sm text-text-muted">Učitavanje...</p>}
      {data && (
        <div className="space-y-2 text-sm">
          <p>
            Međusobno {data.played}: A {data.clubA.wins}W {data.clubA.draws}D {data.clubA.losses}L
            {' · '}
            B {data.clubB.wins}W {data.clubB.draws}D {data.clubB.losses}L
          </p>
          <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
            {data.matches.map((m: H2HAnalytics['matches'][number]) => (
              <li key={m.id} className="px-4 py-2">
                {m.home} {m.homeScore}:{m.awayScore} {m.away}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
