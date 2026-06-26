import type { CompetitionRound } from '../../../types';
import { roundLabel } from '../../../lib/round-utils';

interface Props {
  rounds: CompetitionRound[];
  value: number | null;
  onChange: (round: number | null) => void;
}

export function LeagueRoundPicker({ rounds, value, onChange }: Props) {
  if (!rounds.length) return null;

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
      aria-label="Prikaz tabele"
    >
      <option value="">Ukupna tabela</option>
      {rounds.map((r) => (
        <option key={r.id} value={r.number}>
          Tabela do {roundLabel(r)}
        </option>
      ))}
    </select>
  );
}
