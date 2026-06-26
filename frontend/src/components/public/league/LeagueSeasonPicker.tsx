import type { SeasonOption } from '../../../lib/season-utils';
import { seasonLabel } from '../../../lib/season-utils';

interface Props {
  seasons: SeasonOption[];
  value?: string;
  onChange: (seasonId: string) => void;
}

export function LeagueSeasonPicker({ seasons, value, onChange }: Props) {
  if (seasons.length <= 1) return null;

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
      aria-label="Odaberi sezonu"
    >
      {seasons.map((s) => (
        <option key={s.id} value={s.id}>
          {seasonLabel(s)}
          {s.isActive ? ' · aktivna' : ''}
        </option>
      ))}
    </select>
  );
}
