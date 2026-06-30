import { cn } from '../../lib/utils';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  activeId?: string;
  onChange: (id: string | undefined) => void;
}

export function NewsCategoryFilter({ categories, activeId, onChange }: Props) {
  if (!categories.length) return null;

  const pill = (active: boolean) =>
    cn(
      'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
      active
        ? 'border border-primary/40 bg-primary/20 text-white shadow-[0_0_20px_rgba(0,102,255,0.15)]'
        : 'glass-premium text-white/60 hover:border-white/20 hover:text-white',
    );

  return (
    <div className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-3">
      <button type="button" className={pill(!activeId)} onClick={() => onChange(undefined)}>
        Sve
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={pill(activeId === cat.id)}
          onClick={() => onChange(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
