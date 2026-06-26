import { cn } from '../../../lib/utils';

const colors: Record<string, string> = {
  W: 'bg-success/15 text-success',
  D: 'bg-amber-100 text-amber-800',
  L: 'bg-danger/15 text-danger',
};

export function LeagueFormDots({ form }: { form: string }) {
  if (!form) return <span className="text-text-muted">—</span>;

  return (
    <div className="flex gap-1">
      {form.split('').map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className={cn(
            'inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
            colors[ch] ?? 'bg-slate-100 text-text-muted',
          )}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}
