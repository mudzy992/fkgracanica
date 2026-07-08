import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';

interface Props {
  years: number[];
  categories: string[];
  year?: number;
  category?: string;
  categoryLabel: (c: string) => string;
  onYear: (y: number | undefined) => void;
  onCategory: (c: string | undefined) => void;
}

export function MuseumFilters({
  years,
  categories,
  year,
  category,
  categoryLabel,
  onYear,
  onCategory,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={year == null ? 'default' : 'outline'} onClick={() => onYear(undefined)}>
          Sve godine
        </Button>
        {years.map((y) => (
          <Button
            key={y}
            size="sm"
            variant={year === y ? 'default' : 'outline'}
            className={cn(year === y && 'shadow-sm')}
            onClick={() => onYear(y)}
          >
            {y}
          </Button>
        ))}
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={!category ? 'default' : 'outline'}
            onClick={() => onCategory(undefined)}
          >
            Sve kategorije
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? 'default' : 'outline'}
              onClick={() => onCategory(c)}
            >
              {categoryLabel(c)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
