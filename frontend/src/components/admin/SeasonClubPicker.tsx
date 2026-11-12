import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  const selectAll = () => onChange(clubs.map((c) => c.id));
  const clearAll = () => onChange([]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{t('admin.season.participants')}</p>
        <div className="flex gap-2 text-xs">
          <Button type="button" variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:underline" onClick={selectAll}>
            {t('admin.season.selectAll')}
          </Button>
          <span className="text-text-muted">·</span>
          <Button type="button" variant="ghost" size="sm" className="h-auto p-0 text-xs text-text-muted hover:bg-transparent hover:underline" onClick={clearAll}>
            {t('admin.season.clear')}
          </Button>
        </div>
      </div>
      <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-[var(--border-subtle)] p-3">
        {clubs.map((club) => (
          <label
            key={club.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface"
          >
            <Switch
              checked={value.includes(club.id)}
              onCheckedChange={() => toggle(club.id)}
            />
            <span className="text-sm">
              {club.name}
              {club.isOwnClub && (
                <span className="ml-2 text-xs font-medium text-primary">
                  {t('admin.season.ownClub')}
                </span>
              )}
            </span>
          </label>
        ))}
        {!clubs.length && <p className="text-sm text-text-muted">{t('admin.season.emptyClubs')}</p>}
      </div>
      <p className="text-xs text-text-muted">
        {t('admin.season.selected', { count: value.length })}
      </p>
    </div>
  );
}
