import { cn } from '../../lib/utils';

interface ClubOption {
  id: string;
  name: string;
  isOwnClub?: boolean;
}

interface Props {
  clubs: ClubOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export function SeasonClubPicker({ clubs, value, onChange, className }: Props) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  const selectAll = () => onChange(clubs.map((c) => c.id));
  const clearAll = () => onChange([]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Učesnici sezone *</p>
        <div className="flex gap-2 text-xs">
          <button type="button" className="text-primary hover:underline" onClick={selectAll}>
            Svi
          </button>
          <span className="text-text-muted">·</span>
          <button type="button" className="text-text-muted hover:underline" onClick={clearAll}>
            Očisti
          </button>
        </div>
      </div>
      <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
        {clubs.map((club) => (
          <label
            key={club.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={value.includes(club.id)}
              onChange={() => toggle(club.id)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm">
              {club.name}
              {club.isOwnClub && (
                <span className="ml-2 text-xs font-medium text-primary">(naš klub)</span>
              )}
            </span>
          </label>
        ))}
        {!clubs.length && (
          <p className="text-sm text-text-muted">Nema klubova — prvo dodajte klubove u adminu.</p>
        )}
      </div>
      <p className="text-xs text-text-muted">
        Odabrano: {value.length} · Samo učesnici se pojavljuju u ligaškoj tabeli.
      </p>
    </div>
  );
}
